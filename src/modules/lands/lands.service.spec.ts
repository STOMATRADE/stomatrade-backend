import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LandsService } from './lands.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('LandsService', () => {
  let service: LandsService;
  let prisma: typeof mockPrismaService;

  const mockLand = {
    id: 'land-uuid-1',
    farmerId: 'farmer-uuid-1',
    tokenId: 2001,
    latitude: -6.2,
    longitude: 106.816666,
    address: 'Plot A1, Desa Makmur',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LandsService>(LandsService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new land', async () => {
      const createDto = {
        farmerId: 'farmer-uuid-1',
        tokenId: 2001,
        latitude: -6.2,
        longitude: 106.816666,
        address: 'Plot A1, Desa Makmur',
      };

      prisma.land.create.mockResolvedValue(mockLand);

      const result = await service.create(createDto);

      expect(prisma.land.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockLand);
    });
  });

  describe('findAll', () => {
    it('should return paginated lands', async () => {
      prisma.land.findMany.mockResolvedValue([mockLand]);
      prisma.land.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findByFarmer', () => {
    it('should return lands by farmer id', async () => {
      prisma.land.findMany.mockResolvedValue([mockLand]);
      prisma.land.count.mockResolvedValue(1);

      const result = await service.findByFarmer('farmer-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.land.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { farmerId: 'farmer-uuid-1', deleted: false },
        }),
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a land by id', async () => {
      prisma.land.findUnique.mockResolvedValue(mockLand);

      const result = await service.findOne('land-uuid-1');

      expect(result).toEqual(mockLand);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.land.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a land', async () => {
      const updateDto = { address: 'Updated Address' };
      const updated = { ...mockLand, address: 'Updated Address' };

      prisma.land.findUnique.mockResolvedValue(mockLand);
      prisma.land.update.mockResolvedValue(updated);

      const result = await service.update('land-uuid-1', updateDto);

      expect(result.address).toBe('Updated Address');
    });
  });

  describe('remove', () => {
    it('should soft delete a land', async () => {
      const deleted = { ...mockLand, deleted: true };

      prisma.land.findUnique.mockResolvedValue(mockLand);
      prisma.land.update.mockResolvedValue(deleted);

      const result = await service.remove('land-uuid-1');

      expect(result.deleted).toBe(true);
    });
  });
});

