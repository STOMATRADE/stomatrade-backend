import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StomaTradeContractService } from '../../blockchain/services/stomatrade-contract.service';
import { SUBMISSION_STATUS } from '@prisma/client';
import { CreateProjectSubmissionDto } from './dto/create-project-submission.dto';
import { ApproveProjectSubmissionDto } from './dto/approve-project-submission.dto';
import { RejectProjectSubmissionDto } from './dto/reject-project-submission.dto';
import { toWei } from '../../common/utils/wei-converter.util';

@Injectable()
export class ProjectSubmissionsService {
  private readonly logger = new Logger(ProjectSubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stomaTradeContract: StomaTradeContractService,
  ) { }

  async create(dto: CreateProjectSubmissionDto) {
    this.logger.log(`Creating project submission for project ${dto.projectId}`);

    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        farmer: true,
        land: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    const existingSubmission = await this.prisma.projectSubmission.findUnique({
      where: { projectId: dto.projectId },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        `Project already has a submission with status: ${existingSubmission.status}`,
      );
    }

    const submission = await this.prisma.projectSubmission.create({
      data: {
        projectId: dto.projectId,
        valueProject: dto.valueProject,
        maxCrowdFunding: dto.maxCrowdFunding,
        metadataCid: dto.metadataCid,
        submittedBy: dto.submittedBy,
        status: SUBMISSION_STATUS.SUBMITTED,
      },
      include: {
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
      },
    });

    const encodedCalldata = this.stomaTradeContract.getCreateProjectCalldata(
      dto.metadataCid || '',
      dto.valueProject,
      dto.maxCrowdFunding,
      project.volume.toString(), // totalKilos
      '1', // profitPerKillos (default as missing in DB)
      (project.profitShare || 0).toString(), // sharedProfit
      dto.metadataCid || '',
    );

    this.logger.log(`Project submission created: ${submission.id}`);
    return {
      ...submission,
      encodedCalldata,
    };
  }

  async findAll(status?: SUBMISSION_STATUS) {
    const where = status ? { status, deleted: false } : { deleted: false };

    return await this.prisma.projectSubmission.findMany({
      where,
      include: {
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
        transaction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.projectSubmission.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
        transaction: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Project submission with ID ${id} not found`,
      );
    }

    return submission;
  }

  async approve(id: string, dto: ApproveProjectSubmissionDto, chainId: number) {
    this.logger.log(`Approving project submission ${id}`);

    const submission = await this.findOne(id);

    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve submission with status: ${submission.status}`,
      );
    }

    await this.prisma.projectSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.APPROVED,
        approvedBy: dto.approvedBy,
      },
    });

    try {
      this.logger.log(
        `Minting Project NFT - Value: ${submission.valueProject}, MaxCrowdFunding: ${submission.maxCrowdFunding}, CID: ${submission.metadataCid || 'none'}`,
      );

      // Get project files for CID
      const projectFiles = await this.prisma.file.findMany({
        where: { reffId: submission.project.id },
      });

      const primaryFile = projectFiles.find(f => f.type.startsWith('image/')) || projectFiles[0];
      const cid = primaryFile?.url ? this.extractCID(primaryFile.url) : (submission.metadataCid || '');

      // Convert amount bersih ke wei untuk blockchain
      const valueProject = toWei(submission.valueProject);
      const maxCrowdFunding = toWei(submission.maxCrowdFunding);
      const totalKilos = toWei(submission.project.totalKilos || '0');
      const profitPerKillos = toWei(submission.project.profitPerKillos || '0');
      const sharedProfit = BigInt(submission.project.profitShare || 0);

      const txResult = await this.stomaTradeContract.createProject(
        chainId,
        valueProject,
        maxCrowdFunding,
        BigInt(Math.floor(submission.project.volume)), // totalKilos
        BigInt(1), // profitPerKillos
        BigInt(submission.project.profitShare || 0), // sharedProfit
        cid,
      );

      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'CREATE_PROJECT',
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          toAddress: this.stomaTradeContract.getstomatradeAddress(),
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
        },
      });

      let mintedTokenId: number | null = null;
      if (txResult.receipt) {
        const projectCreatedEvent =
          await this.stomaTradeContract.getEventFromReceipt(
            chainId,
            txResult.receipt,
            'ProjectCreated',
          );

        if (projectCreatedEvent) {
          const contract = await this.stomaTradeContract.getContract(chainId);
          const parsed = contract.interface.parseLog({
            topics: projectCreatedEvent.topics,
            data: projectCreatedEvent.data,
          });

          if (parsed) {
            mintedTokenId = Number(parsed.args.idProject);
            this.logger.log(
              `Project NFT minted with token ID: ${mintedTokenId}`,
            );
          }
        }
      }

      const updatedSubmission = await this.prisma.projectSubmission.update({
        where: { id },
        data: {
          status: SUBMISSION_STATUS.MINTED,
          blockchainTxId: blockchainTx.id,
          mintedTokenId,
        },
        include: {
          project: {
            include: {
              farmer: true,
              land: true,
            },
          },
          transaction: true,
        },
      });

      if (mintedTokenId !== null) {
        await this.prisma.project.update({
          where: { id: submission.projectId },
          data: {
            tokenId: mintedTokenId,
          },
        });
      }

      this.logger.log(`Project submission approved and minted: ${id}`);
      return updatedSubmission;
    } catch (error) {
      this.logger.error('Error minting Project NFT', error);

      await this.prisma.projectSubmission.update({
        where: { id },
        data: {
          status: SUBMISSION_STATUS.SUBMITTED,
          approvedBy: null,
        },
      });

      throw new BadRequestException(
        `Failed to mint Project NFT: ${error.message}`,
      );
    }
  }

  async reject(id: string, dto: RejectProjectSubmissionDto) {
    this.logger.log(`Rejecting project submission ${id}`);

    const submission = await this.findOne(id);

    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject submission with status: ${submission.status}`,
      );
    }

    const rejectedSubmission = await this.prisma.projectSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.REJECTED,
        approvedBy: dto.rejectedBy,
        rejectionReason: dto.rejectionReason,
      },
      include: {
        project: {
          include: {
            farmer: true,
            land: true,
          },
        },
      },
    });

    this.logger.log(`Project submission rejected: ${id}`);
    return rejectedSubmission;
  }
}