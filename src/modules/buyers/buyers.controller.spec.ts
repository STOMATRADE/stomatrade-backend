import { Test, TestingModule } from '@nestjs/testing';
import { BuyersController } from './buyers.controller';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('BuyersController', () => {
    let controller: BuyersController;
    let service: BuyersService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockBuyer = { id: 'buyer-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BuyersController],
            providers: [{ provide: BuyersService, useValue: mockService }],
        }).compile();

        controller = module.get<BuyersController>(BuyersController);
        service = module.get<BuyersService>(BuyersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create buyer', async () => {
            const dto = new CreateBuyerDto();
            mockService.create.mockResolvedValue(mockBuyer);
            expect(await controller.create(dto)).toEqual(mockBuyer);
        });
    });

    describe('findAll', () => {
        it('should return buyers', async () => {
            mockService.findAll.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAll(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });

    describe('findOne', () => {
        it('should return buyer', async () => {
            mockService.findOne.mockResolvedValue(mockBuyer);
            expect(await controller.findOne('id')).toEqual(mockBuyer);
        });
    });
});
