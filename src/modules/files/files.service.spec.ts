import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('FilesService', () => {
  let service: FilesService;
  let prisma: typeof mockPrismaService;

  const mockFile = {
    id: 'file-uuid-1',
    reffId: 'farmer-uuid-1',
    url: 'https://storage.example.com/photo.jpg',
    type: 'image/jpeg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new file', async () => {
      const createDto = {
        reffId: 'farmer-uuid-1',
        url: 'https://storage.example.com/photo.jpg',
        type: 'image/jpeg',
      };

      prisma.file.create.mockResolvedValue(mockFile);

      const result = await service.create(createDto);

      expect(prisma.file.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockFile);
    });
  });

  describe('findAll', () => {
    it('should return paginated files', async () => {
      prisma.file.findMany.mockResolvedValue([mockFile]);
      prisma.file.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findByReffId', () => {
    it('should return files by reference id', async () => {
      prisma.file.findMany.mockResolvedValue([mockFile]);
      prisma.file.count.mockResolvedValue(1);

      const result = await service.findByReffId('farmer-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reffId: 'farmer-uuid-1', deleted: false },
        }),
      );
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a file by id', async () => {
      prisma.file.findUnique.mockResolvedValue(mockFile);

      const result = await service.findOne('file-uuid-1');

      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a file', async () => {
      const deleted = { ...mockFile, deleted: true };

      prisma.file.findUnique.mockResolvedValue(mockFile);
      prisma.file.update.mockResolvedValue(deleted);

      const result = await service.remove('file-uuid-1');

      expect(result.deleted).toBe(true);
    });
  });
});

