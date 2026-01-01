import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: ProjectsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findOngoingProjects: jest.fn(),
        findByFarmer: jest.fn(),
        findByLand: jest.fn(),
        getProjectDetail: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockProject = {
        id: 'project-uuid-1',
        commodity: 'Rice',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [
                {
                    provide: ProjectsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
        service = module.get<ProjectsService>(ProjectsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a project', async () => {
            const dto = new CreateProjectDto(); // Assume basic DTO
            mockService.create.mockResolvedValue(mockProject);

            const result = await controller.create(4202, dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockProject);
        });
    });

    describe('findAll', () => {
        it('should return projects', async () => {
            const pagination = new PaginationDto();
            mockService.findAll.mockResolvedValue({ items: [mockProject], meta: {} });

            const result = await controller.findAll(pagination);

            expect(service.findAll).toHaveBeenCalledWith(pagination);
            expect(result.items).toContain(mockProject);
        });
    });

    describe('findOne', () => {
        it('should return a project', async () => {
            mockService.findOne.mockResolvedValue(mockProject);

            const result = await controller.findOne('project-uuid-1');

            expect(service.findOne).toHaveBeenCalledWith('project-uuid-1');
            expect(result).toEqual(mockProject);
        });
    });

    describe('findOngoingProjects', () => {
        it('should return ongoing projects', async () => {
            const pagination = new PaginationDto();
            mockService.findOngoingProjects.mockResolvedValue({ items: [], meta: {} });

            await controller.findOngoingProjects(pagination);
            expect(service.findOngoingProjects).toHaveBeenCalledWith(pagination);
        });
    });

    describe('findByFarmer', () => {
        it('should return projects by farmer', async () => {
            const pagination = new PaginationDto();
            await controller.findByFarmer('farmer-id', pagination);
            expect(service.findByFarmer).toHaveBeenCalledWith('farmer-id', pagination);
        });
    });

    describe('findByLand', () => {
        it('should return projects by land', async () => {
            const pagination = new PaginationDto();
            await controller.findByLand('land-id', pagination);
            expect(service.findByLand).toHaveBeenCalledWith('land-id', pagination);
        });
    });

    describe('getProjectDetail', () => {
        it('should return project detail', async () => {
            await controller.getProjectDetail('project-id');
            expect(service.getProjectDetail).toHaveBeenCalledWith('project-id');
        });
    });

    describe('update', () => {
        it('should update project', async () => {
            const dto = new UpdateProjectDto();
            mockService.update.mockResolvedValue(mockProject);

            const result = await controller.update('project-id', dto, 4202);

            expect(service.update).toHaveBeenCalledWith('project-id', dto);
            expect(result).toEqual(mockProject);
        });
    });

    describe('remove', () => {
        it('should remove project', async () => {
            mockService.remove.mockResolvedValue(mockProject);

            const result = await controller.remove('project-id');

            expect(service.remove).toHaveBeenCalledWith('project-id');
            expect(result).toEqual(mockProject);
        });
    });
});
