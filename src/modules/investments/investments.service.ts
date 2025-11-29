import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StomaTradeContractService } from '../../blockchain/services/stomatrade-contract.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stomaTradeContract: StomaTradeContractService,
  ) {}

  /**
   * Create an investment and call blockchain
   * Note: In production, this should be called by the investor's wallet, not the platform
   * For now, we'll use the platform wallet for demo purposes
   */
  async create(dto: CreateInvestmentDto) {
    this.logger.log(
      `Creating investment for user ${dto.userId} in project ${dto.projectId}`,
    );

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Verify project exists and has been minted (has tokenId)
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

    // Create investment record (initially without receipt token)
    const investment = await this.prisma.investment.create({
      data: {
        userId: dto.userId,
        projectId: dto.projectId,
        amount: dto.amount,
      },
      include: {
        user: true,
        project: true,
      },
    });

    try {
      this.logger.log(
        `Calling blockchain invest() - ProjectId: ${project.tokenId}, Amount: ${dto.amount}`,
      );

      // Convert to bigint
      const projectTokenId = BigInt(project.tokenId);
      const amount = BigInt(dto.amount);

      // Call smart contract invest function
      const txResult = await this.stomaTradeContract.invest(
        projectTokenId,
        amount,
      );

      // Parse event to get receipt token ID
      let receiptTokenId: number | null = null;
      if (txResult.receipt) {
        const investedEvent = this.stomaTradeContract.getEventFromReceipt(
          txResult.receipt,
          'Invested',
        );

        if (investedEvent) {
          const parsed = this.stomaTradeContract
            .getContract()
            .interface.parseLog({
              topics: investedEvent.topics,
              data: investedEvent.data,
            });

          if (parsed) {
            receiptTokenId = Number(parsed.args.receiptTokenId);
            this.logger.log(
              `Investment receipt NFT minted with token ID: ${receiptTokenId}`,
            );
          }
        }
      }

      // Update investment with blockchain data
      const updatedInvestment = await this.prisma.investment.update({
        where: { id: investment.id },
        data: {
          receiptTokenId,
          transactionHash: txResult.hash,
          blockNumber: txResult.blockNumber || null,
        },
        include: {
          user: true,
          project: true,
        },
      });

      // Update user's portfolio
      await this.updateUserPortfolio(dto.userId);

      this.logger.log(`Investment created successfully: ${investment.id}`);
      return updatedInvestment;
    } catch (error) {
      this.logger.error('Error processing investment on blockchain', error);

      // Delete the investment record on error
      await this.prisma.investment.delete({
        where: { id: investment.id },
      });

      throw new BadRequestException(
        `Failed to process investment on blockchain: ${error.message}`,
      );
    }
  }

  /**
   * Get all investments with optional filters
   */
  async findAll(userId?: string, projectId?: string) {
    const where: any = { deleted: false };

    if (userId) {
      where.userId = userId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    return await this.prisma.investment.findMany({
      where,
      include: {
        user: true,
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
      },
      orderBy: {
        investedAt: 'desc',
      },
    });
  }

  /**
   * Get a single investment by ID
   */
  async findOne(id: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id },
      include: {
        user: true,
        project: {
          include: {
            farmer: true,
            land: true,
            projectSubmission: true,
          },
        },
        profitClaims: true,
      },
    });

    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    return investment;
  }

  /**
   * Get investment statistics for a project
   */
  async getProjectStats(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const investments = await this.prisma.investment.findMany({
      where: { projectId, deleted: false },
    });

    const totalInvested = investments.reduce(
      (sum, inv) => sum + BigInt(inv.amount),
      BigInt(0),
    );

    const investorCount = new Set(investments.map((inv) => inv.userId)).size;

    return {
      projectId,
      totalInvestments: investments.length,
      totalInvested: totalInvested.toString(),
      uniqueInvestors: investorCount,
      investments: investments.map((inv) => ({
        id: inv.id,
        userId: inv.userId,
        amount: inv.amount,
        receiptTokenId: inv.receiptTokenId,
        investedAt: inv.investedAt,
      })),
    };
  }

  /**
   * Update user's investment portfolio
   */
  private async updateUserPortfolio(userId: string) {
    this.logger.log(`Updating portfolio for user ${userId}`);

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

    // For now, totalProfit is same as totalClaimed (will be updated when profit distribution is implemented)
    const totalProfit = totalClaimed;

    const activeInvestments = investments.filter(
      (inv) => inv.receiptTokenId !== null,
    ).length;

    const avgROI =
      totalInvested > BigInt(0)
        ? (Number(totalProfit) / Number(totalInvested)) * 100
        : 0;

    // Upsert portfolio
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

    this.logger.log(`Portfolio updated for user ${userId}`);
  }

  /**
   * Recalculate all user portfolios (can be called by cron job)
   */
  async recalculateAllPortfolios() {
    this.logger.log('Recalculating all user portfolios');

    const users = await this.prisma.user.findMany({
      where: {
        investments: {
          some: {},
        },
      },
    });

    for (const user of users) {
      await this.updateUserPortfolio(user.id);
    }

    this.logger.log(`Recalculated portfolios for ${users.length} users`);
  }
}
