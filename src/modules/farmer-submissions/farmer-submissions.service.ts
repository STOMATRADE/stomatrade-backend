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
  ) { }

  async create(dto: CreateFarmerSubmissionDto, chainId: number) {
    this.logger.log(`Creating farmer submission for farmer ${dto.farmerId}`);

    const farmer = await this.prisma.farmer.findUnique({
      where: { id: dto.farmerId },
    });

    if (!farmer) {
      throw new NotFoundException(`Farmer with ID ${dto.farmerId} not found`);
    }

    const existingSubmission = await this.prisma.farmerSubmission.findUnique({
      where: { farmerId: dto.farmerId },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        `Farmer already has a submission with status: ${existingSubmission.status}`,
      );
    }

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

    const encodedCalldata = await this.stomaTradeContract.getAddFarmerCalldata(
      '', // cid (empty for now or from somewhere else)
      farmer.nik, // idCollector/idFarmer (using NIK as unique ID)
      farmer.name,
      farmer.age,
      farmer.address, // domicile
    );

    this.logger.log(`Farmer submission created: ${submission.id}`);
    return {
      ...submission,
      encodedCalldata,
    };
  }

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

  async approve(id: string, dto: ApproveFarmerSubmissionDto, chainId: number) {
    this.logger.log(`Approving farmer submission ${id}`);

    const submission = await this.findOne(id);

    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve submission with status: ${submission.status}`,
      );
    }

    await this.prisma.farmerSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.APPROVED,
        approvedBy: dto.approvedBy,
      },
    });

    try {
      this.logger.log(
        `Adding Farmer to blockchain: ${submission.farmer.name}`,
      );

      const txResult = await this.stomaTradeContract.addFarmer(
        chainId,
        '', // cid
        submission.farmer.nik,
        submission.farmer.name,
        submission.farmer.age,
        submission.farmer.address,
      );

      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'MINT_FARMER_NFT', // Keep enum for now or update if needed
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
        },
      });

      let mintedTokenId: number | null = null;
      if (txResult.receipt) {
        const farmerMintedEvent = await this.stomaTradeContract.getEventFromReceipt(
          chainId,
          txResult.receipt,
          'FarmerAdded',
        );

        if (farmerMintedEvent) {
          const contract = await this.stomaTradeContract.getContract(chainId);
          const parsed = contract.interface.parseLog({
            topics: farmerMintedEvent.topics,
            data: farmerMintedEvent.data,
          });

          if (parsed) {
            mintedTokenId = Number(parsed.args.idToken);
            this.logger.log(`Farmer NFT minted with token ID: ${mintedTokenId}`);
          }
        }
      }

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

  async reject(id: string, dto: RejectFarmerSubmissionDto) {
    this.logger.log(`Rejecting farmer submission ${id}`);

    const submission = await this.findOne(id);

    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject submission with status: ${submission.status}`,
      );
    }

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