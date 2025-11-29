import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainEventService } from '../../blockchain/services/blockchain-event.service';
import { EthersProviderService } from '../../blockchain/services/ethers-provider.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('CronService', () => {
  let service: CronService;
  let prisma: typeof mockPrismaService;

  const mockBlockchainEventService = {
    queryPastEvents: jest.fn().mockResolvedValue([]),
  };

  const mockEthersProviderService = {
    getBlockNumber: jest.fn().mockResolvedValue(12345678),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BlockchainEventService,
          useValue: mockBlockchainEventService,
        },
        {
          provide: EthersProviderService,
          useValue: mockEthersProviderService,
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recalculatePortfolios', () => {
    it('should recalculate all user portfolios', async () => {
      const mockUsers = [
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.investment.findMany.mockResolvedValue([]);
      prisma.investmentPortfolio.upsert.mockResolvedValue({});

      await service.recalculatePortfolios();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          investments: { some: {} },
          deleted: false,
        },
      });
      expect(prisma.investmentPortfolio.upsert).toHaveBeenCalledTimes(3);
    });

    it('should handle empty user list', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.recalculatePortfolios();

      expect(prisma.investmentPortfolio.upsert).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredData', () => {
    it('should cleanup stale pending transactions', async () => {
      prisma.blockchainTransaction.updateMany.mockResolvedValue({ count: 5 });

      await service.cleanupExpiredData();

      expect(prisma.blockchainTransaction.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
          createdAt: { lt: expect.any(Date) },
        },
        data: {
          status: 'FAILED',
          errorMessage: 'Transaction timed out after 24 hours',
        },
      });
    });
  });

  describe('calculateDailyStats', () => {
    it('should log daily statistics', async () => {
      prisma.user.count.mockResolvedValue(100);
      prisma.farmer.count.mockResolvedValue(50);
      prisma.project.count.mockResolvedValue(25);
      prisma.investment.count.mockResolvedValue(200);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const loggerSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      await service.calculateDailyStats();

      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.farmer.count).toHaveBeenCalledTimes(2);
      expect(prisma.project.count).toHaveBeenCalledTimes(2);
      expect(prisma.investment.count).toHaveBeenCalled();

      consoleSpy.mockRestore();
      loggerSpy.mockRestore();
    });
  });

  describe('syncBlockchainEvents', () => {
    it('should sync blockchain events', async () => {
      mockEthersProviderService.getBlockNumber.mockResolvedValue(12345678);
      mockBlockchainEventService.queryPastEvents.mockResolvedValue([]);

      await service.syncBlockchainEvents();

      expect(mockEthersProviderService.getBlockNumber).toHaveBeenCalled();
    });

    it('should not run if already syncing', async () => {
      // Set isSyncing to true
      (service as any).isSyncing = true;

      await service.syncBlockchainEvents();

      expect(mockEthersProviderService.getBlockNumber).not.toHaveBeenCalled();

      // Reset for other tests
      (service as any).isSyncing = false;
    });
  });
});
