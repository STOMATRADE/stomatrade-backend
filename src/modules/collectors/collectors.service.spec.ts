import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectorsService } from './collectors.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('CollectorsService', () => {
  let service: CollectorsService;
  let prisma: typeof mockPrismaService;

  const mockCollector = {
    id: 'collector-uuid-1',
    userId: 'user-uuid-1',
    nik: '3201234567890123',
    name: 'John Collector',
    address: 'Jakarta',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CollectorsService>(CollectorsService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new collector', async () => {
      const createDto = {
        userId: 'user-uuid-1',
        nik: '3201234567890123',
        name: 'John Collector',
        address: 'Jakarta',
      };

      prisma.collector.create.mockResolvedValue(mockCollector);

      const result = await service.create(createDto);

      expect(prisma.collector.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockCollector);
    });
  });

  describe('findAll', () => {
    it('should return paginated collectors', async () => {
      prisma.collector.findMany.mockResolvedValue([mockCollector]);
      prisma.collector.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a collector by id', async () => {
      prisma.collector.findUnique.mockResolvedValue(mockCollector);

      const result = await service.findOne('collector-uuid-1');

      expect(result).toEqual(mockCollector);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.collector.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a collector', async () => {
      const updateDto = { name: 'Updated Name' };
      const updated = { ...mockCollector, name: 'Updated Name' };

      prisma.collector.findUnique.mockResolvedValue(mockCollector);
      prisma.collector.update.mockResolvedValue(updated);

      const result = await service.update('collector-uuid-1', updateDto);

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should soft delete a collector', async () => {
      const deleted = { ...mockCollector, deleted: true };

      prisma.collector.findUnique.mockResolvedValue(mockCollector);
      prisma.collector.update.mockResolvedValue(deleted);

      const result = await service.remove('collector-uuid-1');

      expect(result.deleted).toBe(true);
    });
  });
});

