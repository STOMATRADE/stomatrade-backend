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

@Injectable()
export class ProjectSubmissionsService {
  private readonly logger = new Logger(ProjectSubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stomaTradeContract: StomaTradeContractService,
  ) {}

  /**
   * Submit a project for blockchain minting approval
   */
  async create(dto: CreateProjectSubmissionDto) {
    this.logger.log(`Creating project submission for project ${dto.projectId}`);

    // Check if project exists
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

    // Check if project already has a submission
    const existingSubmission = await this.prisma.projectSubmission.findUnique({
      where: { projectId: dto.projectId },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        `Project already has a submission with status: ${existingSubmission.status}`,
      );
    }

    // Create submission
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

    this.logger.log(`Project submission created: ${submission.id}`);
    return submission;
  }

  /**
   * Get all project submissions with optional status filter
   */
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

  /**
   * Get a single project submission by ID
   */
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

  /**
   * Approve project submission and mint Project NFT on blockchain
   */
  async approve(id: string, dto: ApproveProjectSubmissionDto) {
    this.logger.log(`Approving project submission ${id}`);

    // Get submission
    const submission = await this.findOne(id);

    // Check status
    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot approve submission with status: ${submission.status}`,
      );
    }

    // Update status to APPROVED
    await this.prisma.projectSubmission.update({
      where: { id },
      data: {
        status: SUBMISSION_STATUS.APPROVED,
        approvedBy: dto.approvedBy,
      },
    });

    // Mint Project NFT on blockchain
    try {
      this.logger.log(
        `Minting Project NFT - Value: ${submission.valueProject}, MaxCrowdFunding: ${submission.maxCrowdFunding}, CID: ${submission.metadataCid || 'none'}`,
      );

      // Convert string amounts to bigint
      const valueProject = BigInt(submission.valueProject);
      const maxCrowdFunding = BigInt(submission.maxCrowdFunding);
      const cid = submission.metadataCid || '';

      const txResult = await this.stomaTradeContract.createProject(
        valueProject,
        maxCrowdFunding,
        cid,
      );

      // Create blockchain transaction record
      const blockchainTx = await this.prisma.blockchainTransaction.create({
        data: {
          transactionHash: txResult.hash,
          transactionType: 'CREATE_PROJECT',
          status: txResult.success ? 'CONFIRMED' : 'FAILED',
          fromAddress: await this.stomaTradeContract.getSignerAddress(),
          toAddress: this.stomaTradeContract.getContractAddress(),
          blockNumber: txResult.blockNumber || null,
          gasUsed: txResult.gasUsed?.toString(),
          gasPrice: txResult.effectiveGasPrice?.toString(),
        },
      });

      // Parse event to get minted project token ID
      let mintedTokenId: number | null = null;
      if (txResult.receipt) {
        const projectCreatedEvent =
          this.stomaTradeContract.getEventFromReceipt(
            txResult.receipt,
            'ProjectCreated',
          );

        if (projectCreatedEvent) {
          const parsed = this.stomaTradeContract
            .getContract()
            .interface.parseLog({
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

      // Update submission with minted status and token ID
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

      // Update project with token ID
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

      // Update status back to SUBMITTED on error
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

  /**
   * Reject project submission
   */
  async reject(id: string, dto: RejectProjectSubmissionDto) {
    this.logger.log(`Rejecting project submission ${id}`);

    // Get submission
    const submission = await this.findOne(id);

    // Check status
    if (submission.status !== SUBMISSION_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `Cannot reject submission with status: ${submission.status}`,
      );
    }

    // Update status to REJECTED
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
