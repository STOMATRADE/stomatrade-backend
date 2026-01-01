import { Test, TestingModule } from '@nestjs/testing';
import { CollectorsController } from './collectors.controller';
import { CollectorsService } from './collectors.service';
import { CreateCollectorDto } from './dto/create-collector.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('CollectorsController', () => {
    let controller: CollectorsController;
    let service: CollectorsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockCollector = { id: 'collector-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CollectorsController],
            providers: [{ provide: CollectorsService, useValue: mockService }],
        }).compile();

        controller = module.get<CollectorsController>(CollectorsController);
        service = module.get<CollectorsService>(CollectorsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create collector', async () => {
            const dto = new CreateCollectorDto();
            mockService.create.mockResolvedValue(mockCollector);
            expect(await controller.create(dto)).toEqual(mockCollector);
        });
    });

    describe('findAll', () => {
        it('should return collectors', async () => {
            mockService.findAll.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAll(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });

    describe('findOne', () => {
        it('should return collector', async () => {
            mockService.findOne.mockResolvedValue(mockCollector);
            expect(await controller.findOne('id')).toEqual(mockCollector);
        });
    });
});
