import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StomaTradeContractService } from '../../blockchain/services/stomatrade-contract.service';
import { MarkRefundableDto } from './dto/mark-refundable.dto';
import { ClaimRefundDto } from './dto/claim-refund.dto';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stomaTradeContract: StomaTradeContractService,
  ) {}

  /**
   * Admin marks a project as refundable (failed crowdfunding)
   */
  async markRefundable(dto: MarkRefundableDto) {
    this.logger.log(`Marking project ${dto.projectId} as refundable`);

    // Verify project exists and has tokenId
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        projectSubmission: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    if (!project.tokenId) {
      throw new BadRequestException(
        'Project has not been minted on blockchain yet',
      );
    }

    try {
      // Call blockchain markRefundable function
      const projectTokenId = BigInt(project.tokenId);

      this.logger.log(
        `Calling blockchain refundable() - ProjectId: ${projectTokenId}`,
      );

      const txResult = await this.stomaTradeContract.markRefundable(projectTokenId);

      // Create blockchain transaction record
      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'REFUND',
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          toAddress: this.stomaTradeContract.getstomatradeAddress(),
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
          eventData: JSON.stringify({
            action: 'markRefundable',
            projectId: dto.projectId,
            reason: dto.reason,
          }),
        },
      });

      this.logger.log(`Project marked as refundable: ${dto.projectId}`);

      return {
        projectId: dto.projectId,
        status: 'REFUNDABLE',
        reason: dto.reason,
        transaction: {
          id: blockchainTx.id,
          hash: txResult.hash,
          blockNumber: txResult.blockNumber,
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
        },
      };
    } catch (error) {
      this.logger.error('Error marking project as refundable', error);
      throw new BadRequestException(
        `Failed to mark project as refundable: ${error.message}`,
      );
    }
  }

  /**
   * Investor claims refund from a failed project
   */
  async claimRefund(dto: ClaimRefundDto) {
    this.logger.log(
      `User ${dto.userId} claiming refund from project ${dto.projectId}`,
    );

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Verify project exists and has tokenId
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    if (!project.tokenId) {
      throw new BadRequestException(
        'Project has not been minted on blockchain yet',
      );
    }

    // Verify user has invested in this project
    const investment = await this.prisma.investment.findFirst({
      where: {
        userId: dto.userId,
        projectId: dto.projectId,
        deleted: false,
      },
    });

    if (!investment) {
      throw new BadRequestException(
        'User has not invested in this project',
      );
    }

    try {
      // Call blockchain claimRefund function
      const projectTokenId = BigInt(project.tokenId);

      this.logger.log(
        `Calling blockchain claimRefund() - ProjectId: ${projectTokenId}`,
      );

      const txResult = await this.stomaTradeContract.claimRefund(projectTokenId);

      // Parse event to get refunded amount
      let refundedAmount = investment.amount; // Default to full investment amount
      if (txResult.receipt) {
        const refundedEvent = this.stomaTradeContract.getEventFromReceipt(
          txResult.receipt,
          'Refunded',
        );

        if (refundedEvent) {
          const parsed = this.stomaTradeContract
            .getContract()
            .interface.parseLog({
              topics: refundedEvent.topics,
              data: refundedEvent.data,
            });

          if (parsed) {
            refundedAmount = parsed.args.amount.toString();
            this.logger.log(`Refund claimed: ${refundedAmount}`);
          }
        }
      }

      // Create blockchain transaction record
      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'REFUND',
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          toAddress: user.walletAddress,
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
          eventData: JSON.stringify({
            action: 'claimRefund',
            userId: dto.userId,
            projectId: dto.projectId,
            amount: refundedAmount,
          }),
        },
      });

      // Mark investment as refunded (soft delete or add refunded flag)
      await this.prisma.investment.update({
        where: { id: investment.id },
        data: {
          deleted: true, // Mark as refunded via soft delete
        },
      });

      // Update user portfolio
      await this.updateUserPortfolioAfterRefund(dto.userId);

      this.logger.log(`Refund claimed successfully: ${investment.id}`);

      return {
        investmentId: investment.id,
        userId: dto.userId,
        projectId: dto.projectId,
        refundedAmount,
        transaction: {
          id: blockchainTx.id,
          hash: txResult.hash,
          blockNumber: txResult.blockNumber,
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
        },
      };
    } catch (error) {
      this.logger.error('Error claiming refund', error);
      throw new BadRequestException(
        `Failed to claim refund: ${error.message}`,
      );
    }
  }

  /**
   * Get refundable projects
   */
  async getRefundableProjects() {
    // In a real implementation, you'd query the blockchain or have a status field
    // For now, we return projects that are likely refundable based on conditions
    const projects = await this.prisma.project.findMany({
      where: {
        tokenId: { not: null },
        deleted: false,
      },
      include: {
        farmer: true,
        investments: {
          where: { deleted: false },
        },
        projectSubmission: true,
      },
    });

    return projects;
  }

  /**
   * Get user's refund claims
   */
  async getUserRefundClaims(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get refunded investments (soft deleted)
    const refundedInvestments = await this.prisma.investment.findMany({
      where: {
        userId,
        deleted: true,
      },
      include: {
        project: {
          include: {
            farmer: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return refundedInvestments;
  }

  // ============ HELPER METHODS ============

  private async updateUserPortfolioAfterRefund(userId: string) {
    const investments = await this.prisma.investment.findMany({
      where: { userId, deleted: false },
      include: {
        profitClaims: true,
      },
    });

    const totalInvested = investments.reduce(
      (sum, inv) => sum + BigInt(inv.amount),
      BigInt(0),
    );

    const totalClaimed = investments.reduce((sum, inv) => {
      const claimed = inv.profitClaims.reduce(
        (claimSum, claim) => claimSum + BigInt(claim.amount),
        BigInt(0),
      );
      return sum + claimed;
    }, BigInt(0));

    const totalProfit = totalClaimed;
    const activeInvestments = investments.filter(
      (inv) => inv.receiptTokenId !== null,
    ).length;

    const avgROI =
      totalInvested > BigInt(0)
        ? (Number(totalProfit) / Number(totalInvested)) * 100
        : 0;

    await this.prisma.investmentPortfolio.upsert({
      where: { userId },
      update: {
        totalInvested: totalInvested.toString(),
        totalProfit: totalProfit.toString(),
        totalClaimed: totalClaimed.toString(),
        activeInvestments,
        avgROI,
        lastCalculatedAt: new Date(),
      },
      create: {
        userId,
        totalInvested: totalInvested.toString(),
        totalProfit: totalProfit.toString(),
        totalClaimed: totalClaimed.toString(),
        activeInvestments,
        completedInvestments: 0,
        avgROI,
      },
    });
  }
}

