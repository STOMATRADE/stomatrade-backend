import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FarmerSubmissionsService } from './farmer-submissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StomaTradeContractService } from '../../blockchain/services/stomatrade-contract.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';
import { mockStomaTradeContractService } from '../../test/mocks/blockchain.mock';
import { SUBMISSION_STATUS } from '@prisma/client';

describe('FarmerSubmissionsService', () => {
  let service: FarmerSubmissionsService;
  let prisma: typeof mockPrismaService;
  let contractService: typeof mockStomaTradeContractService;

  const mockFarmer = {
    id: 'farmer-uuid-1',
    name: 'John Farmer',
    nik: '3201234567890123',
    age: 45,
    address: 'Farmer Address',
    collectorId: 'collector-uuid-1',
  };

  const mockSubmission = {
    id: 'submission-uuid-1',
    farmerId: 'farmer-uuid-1',
    commodity: 'Coffee Arabica',
    status: SUBMISSION_STATUS.SUBMITTED,
    submittedBy: '0xSubmitterAddress',
    approvedBy: null,
    rejectionReason: null,
    blockchainTxId: null,
    mintedTokenId: null,
    encodedCalldata: '0xencodeddata',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
    farmer: mockFarmer,
    transaction: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmerSubmissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StomaTradeContractService,
          useValue: mockStomaTradeContractService,
        },
      ],
    }).compile();

    service = module.get<FarmerSubmissionsService>(FarmerSubmissionsService);
    prisma = mockPrismaService;
    contractService = mockStomaTradeContractService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a farmer submission', async () => {
      const createDto = {
        farmerId: 'farmer-uuid-1',
        commodity: 'Coffee Arabica',
        submittedBy: '0xSubmitterAddress',
      };

      prisma.farmer.findUnique.mockResolvedValue(mockFarmer);
      prisma.farmerSubmission.findUnique.mockResolvedValue(null);
      prisma.farmerSubmission.create.mockResolvedValue(mockSubmission);

      const result = await service.create(createDto, 4202);

      expect(prisma.farmerSubmission.create).toHaveBeenCalled();
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if farmer not found', async () => {
      prisma.farmer.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          farmerId: 'non-existent',
          commodity: 'Coffee',
          submittedBy: '0x123',
        }, 4202),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if submission already exists', async () => {
      prisma.farmer.findUnique.mockResolvedValue(mockFarmer);
      prisma.farmerSubmission.findUnique.mockResolvedValue(mockSubmission);

      await expect(
        service.create({
          farmerId: 'farmer-uuid-1',
          commodity: 'Coffee',
          submittedBy: '0x123',
        }, 4202),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all submissions', async () => {
      prisma.farmerSubmission.findMany.mockResolvedValue([mockSubmission]);

      const result = await service.findAll();

      expect(prisma.farmerSubmission.findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        include: {
          farmer: true,
          transaction: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      prisma.farmerSubmission.findMany.mockResolvedValue([mockSubmission]);

      await service.findAll(SUBMISSION_STATUS.SUBMITTED);

      expect(prisma.farmerSubmission.findMany).toHaveBeenCalledWith({
        where: { status: SUBMISSION_STATUS.SUBMITTED, deleted: false },
        include: {
          farmer: true,
          transaction: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a submission by id', async () => {
      prisma.farmerSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findOne('submission-uuid-1');

      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.farmerSubmission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    it('should approve and mint farmer NFT', async () => {
      const approvedSubmission = {
        ...mockSubmission,
        status: SUBMISSION_STATUS.APPROVED,
        approvedBy: '0xAdminWallet',
      };
      const mintedSubmission = {
        ...approvedSubmission,
        status: SUBMISSION_STATUS.MINTED,
        mintedTokenId: 1001,
        blockchainTxId: 'tx-uuid-1',
      };

      prisma.farmerSubmission.findUnique.mockResolvedValue(mockSubmission);
      prisma.farmerSubmission.update
        .mockResolvedValueOnce(approvedSubmission)
        .mockResolvedValueOnce(mintedSubmission);
      prisma.blockchainTransaction.create.mockResolvedValue({
        id: 'tx-uuid-1',
        transactionHash: '0xTxHash',
      });
      prisma.farmer.update.mockResolvedValue({
        ...mockFarmer,
        tokenId: 1001,
      });
      prisma.file.findMany.mockResolvedValue([]);

      contractService.addFarmer.mockResolvedValue({
        hash: '0xTxHash',
        receipt: { status: 1, logs: [] },
        success: true,
        blockNumber: 12345678,
      });
      contractService.getContract.mockReturnValue({
        runner: { address: '0xPlatformAddress' },
        interface: {
          parseLog: jest.fn().mockReturnValue({
            name: 'FarmerMinted',
            args: { nftId: BigInt(1001) },
          }),
        },
      });
      contractService.getEventFromReceipt.mockReturnValue({
        topics: ['0xtopic1'],
        data: '0xdata',
      });

      const result = await service.approve('submission-uuid-1', {
        approvedBy: '0xAdminWallet',
      }, 4202);

      expect(contractService.addFarmer).toHaveBeenCalled();
      expect(result.status).toBe(SUBMISSION_STATUS.MINTED);
    });

    it('should throw BadRequestException if already processed', async () => {
      const approvedSubmission = {
        ...mockSubmission,
        status: SUBMISSION_STATUS.APPROVED,
      };
      prisma.farmerSubmission.findUnique.mockResolvedValue(approvedSubmission);

      await expect(
        service.approve('submission-uuid-1', { approvedBy: '0xAdmin' }, 4202),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a submission', async () => {
      const rejectedSubmission = {
        ...mockSubmission,
        status: SUBMISSION_STATUS.REJECTED,
        approvedBy: '0xAdminWallet',
        rejectionReason: 'Invalid documents',
      };

      prisma.farmerSubmission.findUnique.mockResolvedValue(mockSubmission);
      prisma.farmerSubmission.update.mockResolvedValue(rejectedSubmission);

      const result = await service.reject('submission-uuid-1', {
        rejectedBy: '0xAdminWallet',
        rejectionReason: 'Invalid documents',
      });

      expect(result.status).toBe(SUBMISSION_STATUS.REJECTED);
      expect(result.rejectionReason).toBe('Invalid documents');
    });

    it('should throw BadRequestException if already processed', async () => {
      const rejectedSubmission = {
        ...mockSubmission,
        status: SUBMISSION_STATUS.REJECTED,
      };
      prisma.farmerSubmission.findUnique.mockResolvedValue(rejectedSubmission);

      await expect(
        service.reject('submission-uuid-1', { rejectedBy: '0xAdmin' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
