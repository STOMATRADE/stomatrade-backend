import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StomaTradeContractService } from '../../blockchain/services/stomatrade-contract.service';
import { SUBMISSION_STATUS } from '@prisma/client';
import { CreateFarmerSubmissionDto } from './dto/create-farmer-submission.dto';
import { ApproveFarmerSubmissionDto } from './dto/approve-farmer-submission.dto';
import { RejectFarmerSubmissionDto } from './dto/reject-farmer-submission.dto';

@Injectable()
export class FarmerSubmissionsService {
  private readonly logger = new Logger(FarmerSubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stomaTradeContract: StomaTradeContractService,
  ) {}

  /**
   * Submit a farmer for NFT minting approval
   */
  async create(dto: CreateFarmerSubmissionDto) {
    this.logger.log(`Creating farmer submission for farmer ${dto.farmerId}`);

    // Check if farmer exists
    const farmer = await this.prisma.farmer.findUnique({
      where: { id: dto.farmerId },
    });

    if (!farmer) {
      throw new NotFoundException(`Farmer with ID ${dto.farmerId} not found`);
    }

    // Check if farmer already has a submission
    const existingSubmission = await this.prisma.farmerSubmission.findUnique({
      where: { farmerId: dto.farmerId },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        `Farmer already has a submission with status: ${existingSubmission.status}`,
      );
    }

    // Create submission
    const submission = await this.prisma.farmerSubmission.create({
      data: {
        farmerId: dto.farmerId,
        commodity: dto.commodity,
        submittedBy: dto.submittedBy,
        status: SUBMISSION_STATUS.SUBMITTED,
      },
      include: {
        farmer: true,
      },
    });

    const encodedCalldata = this.stomaTradeContract.getMintFarmerCalldata(
      dto.commodity,
    );

    this.logger.log(`Farmer submission created: ${submission.id}`);
    return {
      ...submission,
      encodedCalldata,
    };
  }

  /**
   * Get all farmer submissions with optional status filter
   */
  async findAll(status?: SUBMISSION_STATUS) {
    const where = status ? { status, deleted: false } : { deleted: false };

    return await this.prisma.farmerSubmission.findMany({
      where,
      include: {
        farmer: true,
        transaction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single farmer submission by ID
   */
  async findOne(id: string) {
    const submission = await this.prisma.farmerSubmission.findUnique({
      where: { id },
      include: {
        farmer: true,
        transaction: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Farmer submission with ID ${id} not found`,
      );
    }

    return submission;
  }

  /**
   * Approve farmer submission and mint NFT on blockchain
   */
  async approve(id: string, dto: ApproveFarmerSubmissionDto) {
    this.logger.log(`Approving farmer submission ${id}`);

    // Get submission
    const submission = await this.findOne(id);

    // Check status
    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve submission with status: ${submission.status}`,
      );
    }

    // Update status to APPROVED
    await this.prisma.farmerSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.APPROVED,
        approvedBy: dto.approvedBy,
      },
    });

    // Mint NFT on blockchain
    try {
      this.logger.log(
        `Minting Farmer NFT for commodity: ${submission.commodity}`,
      );

      const txResult = await this.stomaTradeContract.mintFarmerNFT(
        submission.commodity,
      );

      // Create blockchain transaction record
      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'MINT_FARMER_NFT',
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
        },
      });

      // Parse event to get minted token ID
      let mintedTokenId: number | null = null;
      if (txResult.receipt) {
        const farmerMintedEvent = this.stomaTradeContract.getEventFromReceipt(
          txResult.receipt,
          'FarmerMinted',
        );

        if (farmerMintedEvent) {
          const parsed = this.stomaTradeContract
            .getContract()
            .interface.parseLog({
              topics: farmerMintedEvent.topics,
              data: farmerMintedEvent.data,
            });

          if (parsed) {
            mintedTokenId = Number(parsed.args.nftId);
            this.logger.log(`Farmer NFT minted with token ID: ${mintedTokenId}`);
          }
        }
      }

      // Update submission with minted status and token ID
      const updatedSubmission = await this.prisma.farmerSubmission.update({
        where: { id },
        data: {
          status: SUBMISSION_STATUS.MINTED,
          blockchainTxId: blockchainTx.id,
          mintedTokenId,
        },
        include: {
          farmer: true,
          transaction: true,
        },
      });

      // Update farmer with token ID
      if (mintedTokenId !== null) {
        await this.prisma.farmer.update({
          where: { id: submission.farmerId },
          data: {
            tokenId: mintedTokenId,
          },
        });
      }

      this.logger.log(`Farmer submission approved and minted: ${id}`);
      return updatedSubmission;
    } catch (error) {
      this.logger.error('Error minting Farmer NFT', error);

      // Update status back to SUBMITTED on error
      await this.prisma.farmerSubmission.update({
        where: { id },
        data: {
          status: SUBMISSION_STATUS.SUBMITTED,
          approvedBy: null,
        },
      });

      throw new BadRequestException(
        `Failed to mint Farmer NFT: ${error.message}`,
      );
    }
  }

  /**
   * Reject farmer submission
   */
  async reject(id: string, dto: RejectFarmerSubmissionDto) {
    this.logger.log(`Rejecting farmer submission ${id}`);

    // Get submission
    const submission = await this.findOne(id);

    // Check status
    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject submission with status: ${submission.status}`,
      );
    }

    // Update status to REJECTED
    const rejectedSubmission = await this.prisma.farmerSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.REJECTED,
        approvedBy: dto.rejectedBy,
        rejectionReason: dto.rejectionReason,
      },
      include: {
        farmer: true,
      },
    });

    this.logger.log(`Farmer submission rejected: ${id}`);
    return rejectedSubmission;
  }
}
