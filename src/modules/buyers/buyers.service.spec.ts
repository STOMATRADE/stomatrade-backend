import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('BuyersService', () => {
  let service: BuyersService;
  let prisma: typeof mockPrismaService;

  const mockBuyer = {
    id: 'buyer-uuid-1',
    companyName: 'PT Agro Makmur',
    companyAddress: 'Jl. Industri No. 789',
    phoneNumber: '081234567890',
    companyMail: 'info@agromakmur.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  const mockBuyerHistory = {
    id: 'history-uuid-1',
    buyerId: 'buyer-uuid-1',
    buyerTransactionSuccess: 10,
    buyerTransactionFail: 2,
    buyerTier: 'GOLD',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BuyersService>(BuyersService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Buyer CRUD', () => {
    describe('create', () => {
      it('should create a new buyer', async () => {
        const createDto = {
          companyName: 'PT Agro Makmur',
          companyAddress: 'Jl. Industri No. 789',
          phoneNumber: '081234567890',
          companyMail: 'info@agromakmur.com',
        };

        prisma.buyer.create.mockResolvedValue(mockBuyer);

        const result = await service.create(createDto);

        expect(prisma.buyer.create).toHaveBeenCalledWith({
          data: createDto,
        });
        expect(result).toEqual(mockBuyer);
      });
    });

    describe('findAll', () => {
      it('should return paginated buyers', async () => {
        prisma.buyer.findMany.mockResolvedValue([mockBuyer]);
        prisma.buyer.count.mockResolvedValue(1);

        const result = await service.findAll({ page: 1, limit: 10 });

        expect(result.data).toHaveLength(1);
        expect(result.meta.total).toBe(1);
      });
    });

    describe('findOne', () => {
      it('should return a buyer by id', async () => {
        prisma.buyer.findUnique.mockResolvedValue(mockBuyer);

        const result = await service.findOne('buyer-uuid-1');

        expect(result).toEqual(mockBuyer);
      });

      it('should throw NotFoundException if not found', async () => {
        prisma.buyer.findUnique.mockResolvedValue(null);

        await expect(service.findOne('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('update', () => {
      it('should update a buyer', async () => {
        const updateDto = { companyName: 'PT Agro Makmur Jaya' };
        const updated = { ...mockBuyer, companyName: 'PT Agro Makmur Jaya' };

        prisma.buyer.findUnique.mockResolvedValue(mockBuyer);
        prisma.buyer.update.mockResolvedValue(updated);

        const result = await service.update('buyer-uuid-1', updateDto);

        expect(result.companyName).toBe('PT Agro Makmur Jaya');
      });
    });

    describe('remove', () => {
      it('should soft delete a buyer', async () => {
        const deleted = { ...mockBuyer, deleted: true };

        prisma.buyer.findUnique.mockResolvedValue(mockBuyer);
        prisma.buyer.update.mockResolvedValue(deleted);

        const result = await service.remove('buyer-uuid-1');

        expect(result.deleted).toBe(true);
      });
    });
  });

  describe('Buyer History CRUD', () => {
    describe('createHistory', () => {
      it('should create buyer history', async () => {
        const createDto = {
          buyerId: 'buyer-uuid-1',
          buyerTransactionSuccess: 10,
          buyerTransactionFail: 2,
          buyerTier: 'GOLD',
        };

        prisma.buyerHistory.create.mockResolvedValue(mockBuyerHistory);

        const result = await service.createHistory(createDto);

        expect(prisma.buyerHistory.create).toHaveBeenCalled();
        expect(result).toEqual(mockBuyerHistory);
      });
    });

    describe('findHistoryByBuyer', () => {
      it('should return history by buyer id', async () => {
        prisma.buyerHistory.findMany.mockResolvedValue([mockBuyerHistory]);
        prisma.buyerHistory.count.mockResolvedValue(1);

        const result = await service.findHistoryByBuyer('buyer-uuid-1', {
          page: 1,
          limit: 10,
        });

        expect(result.data).toHaveLength(1);
      });
    });

    describe('findOneHistory', () => {
      it('should return history by id', async () => {
        prisma.buyerHistory.findUnique.mockResolvedValue(mockBuyerHistory);

        const result = await service.findOneHistory('history-uuid-1');

        expect(result).toEqual(mockBuyerHistory);
      });
    });

    describe('updateHistory', () => {
      it('should update buyer history', async () => {
        const updateDto = { buyerTier: 'PLATINUM' };
        const updated = { ...mockBuyerHistory, buyerTier: 'PLATINUM' };

        prisma.buyerHistory.findUnique.mockResolvedValue(mockBuyerHistory);
        prisma.buyerHistory.update.mockResolvedValue(updated);

        const result = await service.updateHistory('history-uuid-1', updateDto);

        expect(result.buyerTier).toBe('PLATINUM');
      });
    });

    describe('removeHistory', () => {
      it('should soft delete buyer history', async () => {
        const deleted = { ...mockBuyerHistory, deleted: true };

        prisma.buyerHistory.findUnique.mockResolvedValue(mockBuyerHistory);
        prisma.buyerHistory.update.mockResolvedValue(deleted);

        const result = await service.removeHistory('history-uuid-1');

        expect(result.deleted).toBe(true);
      });
    });
  });
});

