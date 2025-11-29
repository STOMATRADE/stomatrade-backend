import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: typeof mockPrismaService;

  const mockProject = {
    id: 'project-uuid-1',
    tokenId: null,
    commodity: 'Rice',
    volume: 1000.5,
    gradeQuality: 'A',
    farmerId: 'farmer-uuid-1',
    landId: 'land-uuid-1',
    sendDate: new Date('2025-02-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = {
        commodity: 'Rice',
        volume: 1000.5,
        gradeQuality: 'A',
        farmerId: 'farmer-uuid-1',
        landId: 'land-uuid-1',
        sendDate: '2025-02-15T08:00:00.000Z',
      };

      prisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create(createDto);

      expect(prisma.project.create).toHaveBeenCalled();
      expect(result).toEqual(mockProject);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      prisma.project.findMany.mockResolvedValue([mockProject]);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findByFarmer', () => {
    it('should return projects by farmer id', async () => {
      prisma.project.findMany.mockResolvedValue([mockProject]);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.findByFarmer('farmer-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { farmerId: 'farmer-uuid-1', deleted: false },
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByLand', () => {
    it('should return projects by land id', async () => {
      prisma.project.findMany.mockResolvedValue([mockProject]);
      prisma.project.count.mockResolvedValue(1);

      const result = await service.findByLand('land-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { landId: 'land-uuid-1', deleted: false },
        }),
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('project-uuid-1');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { commodity: 'Premium Rice' };
      const updated = { ...mockProject, commodity: 'Premium Rice' };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue(updated);

      const result = await service.update('project-uuid-1', updateDto);

      expect(result.commodity).toBe('Premium Rice');
    });
  });

  describe('remove', () => {
    it('should soft delete a project', async () => {
      const deleted = { ...mockProject, deleted: true };

      prisma.project.findUnique.mockResolvedValue(mockProject);
      prisma.project.update.mockResolvedValue(deleted);

      const result = await service.remove('project-uuid-1');

      expect(result.deleted).toBe(true);
    });
  });
});

