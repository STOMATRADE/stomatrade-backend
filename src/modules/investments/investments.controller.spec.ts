import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

describe('InvestmentsController', () => {
    let controller: InvestmentsController;
    let service: InvestmentsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        recalculateAllPortfolios: jest.fn(),
        getProjectStats: jest.fn(),
    };

    const mockInvestment = {
        id: 'investment-uuid-1',
        userId: 'user-uuid-1',
        amount: '1000',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InvestmentsController],
            providers: [
                {
                    provide: InvestmentsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<InvestmentsController>(InvestmentsController);
        service = module.get<InvestmentsService>(InvestmentsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create an investment', async () => {
            const dto: CreateInvestmentDto = {
                userId: 'user-uuid-1',
                projectId: 'project-uuid-1',
                amount: '1000',
            };
            mockService.create.mockResolvedValue(mockInvestment);

            const result = await controller.create(dto, 4202);

            expect(service.create).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockInvestment);
        });
    });

    describe('findAll', () => {
        it('should return all investments', async () => {
            mockService.findAll.mockResolvedValue([mockInvestment]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockInvestment]);
        });

        it('should filter by userId', async () => {
            mockService.findAll.mockResolvedValue([mockInvestment]);

            const result = await controller.findAll('user-uuid-1');

            expect(service.findAll).toHaveBeenCalledWith('user-uuid-1', undefined);
            expect(result).toEqual([mockInvestment]);
        });
    });

    describe('findOne', () => {
        it('should return an investment', async () => {
            mockService.findOne.mockResolvedValue(mockInvestment);

            const result = await controller.findOne('investment-uuid-1');

            expect(service.findOne).toHaveBeenCalledWith('investment-uuid-1');
            expect(result).toEqual(mockInvestment);
        });
    });

    describe('recalculatePortfolios', () => {
        it('should call recalculateAllPortfolios', async () => {
            mockService.recalculateAllPortfolios.mockResolvedValue({ count: 5 });

            const result = await controller.recalculatePortfolios();

            expect(service.recalculateAllPortfolios).toHaveBeenCalled();
            expect(result).toEqual({ count: 5 });
        });
    });

    describe('getProjectStats', () => {
        it('should return project stats', async () => {
            const stats = { totalRaised: '1000', investorCount: 2 };
            mockService.getProjectStats.mockResolvedValue(stats);

            const result = await controller.getProjectStats('project-uuid-1');

            expect(service.getProjectStats).toHaveBeenCalledWith('project-uuid-1');
            expect(result).toEqual(stats);
        });
    });
});
