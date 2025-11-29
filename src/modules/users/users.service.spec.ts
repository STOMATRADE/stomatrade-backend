import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';
import { ROLES } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
    role: ROLES.INVESTOR,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
        role: ROLES.INVESTOR,
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(users);
      expect(result.meta.total).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-uuid-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1', deleted: false },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { role: ROLES.ADMIN };
      const updatedUser = { ...mockUser, role: ROLES.ADMIN };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-uuid-1', updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: updateUserDto,
      });
      expect(result.role).toBe(ROLES.ADMIN);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { role: ROLES.ADMIN }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deletedUser = { ...mockUser, deleted: true };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove('user-uuid-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { deleted: true },
      });
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

