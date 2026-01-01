import { Test, TestingModule } from '@nestjs/testing';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('FarmersController', () => {
    let controller: FarmersController;
    let service: FarmersService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByCollector: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockFarmer = { id: 'farmer-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FarmersController],
            providers: [{ provide: FarmersService, useValue: mockService }],
        }).compile();

        controller = module.get<FarmersController>(FarmersController);
        service = module.get<FarmersService>(FarmersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create farmer', async () => {
            const dto = new CreateFarmerDto();
            mockService.create.mockResolvedValue(mockFarmer);
            expect(await controller.create(dto)).toEqual(mockFarmer);
        });
    });

    describe('findAll', () => {
        it('should return farmers', async () => {
            mockService.findAll.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAll(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });

    describe('findOne', () => {
        it('should return farmer', async () => {
            mockService.findOne.mockResolvedValue(mockFarmer);
            expect(await controller.findOne('id')).toEqual(mockFarmer);
        });
    });
});
