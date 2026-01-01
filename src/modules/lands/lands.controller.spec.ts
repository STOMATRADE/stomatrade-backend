import { Test, TestingModule } from '@nestjs/testing';
import { LandsController } from './lands.controller';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('LandsController', () => {
    let controller: LandsController;
    let service: LandsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByFarmer: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockLand = { id: 'land-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LandsController],
            providers: [{ provide: LandsService, useValue: mockService }],
        }).compile();

        controller = module.get<LandsController>(LandsController);
        service = module.get<LandsService>(LandsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create land', async () => {
            const dto = new CreateLandDto();
            mockService.create.mockResolvedValue(mockLand);
            expect(await controller.create(dto)).toEqual(mockLand);
        });
    });

    describe('findAll', () => {
        it('should return lands', async () => {
            mockService.findAll.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAll(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });

    describe('findOne', () => {
        it('should return land', async () => {
            mockService.findOne.mockResolvedValue(mockLand);
            expect(await controller.findOne('id')).toEqual(mockLand);
        });
    });
});
