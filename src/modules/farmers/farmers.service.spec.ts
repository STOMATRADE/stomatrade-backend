import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';
import { GENDER } from '@prisma/client';

describe('FarmersService', () => {
  let service: FarmersService;
  let prisma: typeof mockPrismaService;

  const mockFarmer = {
    id: 'farmer-uuid-1',
    collectorId: 'collector-uuid-1',
    tokenId: null,
    nik: '3201234567890124',
    name: 'Jane Farmer',
    age: 35,
    gender: GENDER.FEMALE,
    address: 'Desa Makmur',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FarmersService>(FarmersService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new farmer', async () => {
      const createDto = {
        collectorId: 'collector-uuid-1',
        nik: '3201234567890124',
        name: 'Jane Farmer',
        age: 35,
        gender: GENDER.FEMALE,
        address: 'Desa Makmur',
      };

      prisma.farmer.create.mockResolvedValue(mockFarmer);

      const result = await service.create(createDto);

      expect(prisma.farmer.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockFarmer);
    });
  });

  describe('findAll', () => {
    it('should return paginated farmers', async () => {
      prisma.farmer.findMany.mockResolvedValue([mockFarmer]);
      prisma.farmer.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findByCollector', () => {
    it('should return farmers by collector id', async () => {
      prisma.farmer.findMany.mockResolvedValue([mockFarmer]);
      prisma.farmer.count.mockResolvedValue(1);

      const result = await service.findByCollector('collector-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.farmer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { collectorId: 'collector-uuid-1', deleted: false },
        }),
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a farmer by id', async () => {
      prisma.farmer.findUnique.mockResolvedValue(mockFarmer);

      const result = await service.findOne('farmer-uuid-1');

      expect(result).toEqual(mockFarmer);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.farmer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a farmer', async () => {
      const updateDto = { name: 'Updated Name', age: 36 };
      const updated = { ...mockFarmer, ...updateDto };

      prisma.farmer.findUnique.mockResolvedValue(mockFarmer);
      prisma.farmer.update.mockResolvedValue(updated);

      const result = await service.update('farmer-uuid-1', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(result.age).toBe(36);
    });
  });

  describe('remove', () => {
    it('should soft delete a farmer', async () => {
      const deleted = { ...mockFarmer, deleted: true };

      prisma.farmer.findUnique.mockResolvedValue(mockFarmer);
      prisma.farmer.update.mockResolvedValue(deleted);

      const result = await service.remove('farmer-uuid-1');

      expect(result.deleted).toBe(true);
    });
  });
});

