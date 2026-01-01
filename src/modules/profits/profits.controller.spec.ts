import { Test, TestingModule } from '@nestjs/testing';
import { ProfitsController } from './profits.controller';
import { ProfitsService } from './profits.service';
import { DepositProfitDto } from './dto/deposit-profit.dto';
import { ClaimProfitDto } from './dto/claim-profit.dto';

describe('ProfitsController', () => {
    let controller: ProfitsController;
    let service: ProfitsService;

    const mockService = {
        depositProfit: jest.fn(),
        claimProfit: jest.fn(),
        getAllProfitPools: jest.fn(),
        getProjectProfitPool: jest.fn(),
        getUserProfitClaims: jest.fn(),
    };

    const mockProfit = {
        id: 'profit-id-1',
        amount: '1000',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProfitsController],
            providers: [
                {
                    provide: ProfitsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<ProfitsController>(ProfitsController);
        service = module.get<ProfitsService>(ProfitsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('depositProfit', () => {
        it('should deposit profit', async () => {
            const dto: DepositProfitDto = {
                projectId: 'project-id',
                amount: '1000',
            };
            mockService.depositProfit.mockResolvedValue(mockProfit);

            const result = await controller.depositProfit(dto, 4202);

            expect(service.depositProfit).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockProfit);
        });
    });

    describe('claimProfit', () => {
        it('should claim profit', async () => {
            const dto: ClaimProfitDto = {
                projectId: 'project-id',
                userId: 'user-id',
            };
            mockService.claimProfit.mockResolvedValue(mockProfit);

            const result = await controller.claimProfit(dto, 4202);

            expect(service.claimProfit).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockProfit);
        });
    });

    describe('getAllProfitPools', () => {
        it('should return all pools', async () => {
            mockService.getAllProfitPools.mockResolvedValue([mockProfit]);
            const result = await controller.getAllProfitPools();
            expect(service.getAllProfitPools).toHaveBeenCalled();
            expect(result).toEqual([mockProfit]);
        });
    });

    describe('getProjectProfitPool', () => {
        it('should return project pool', async () => {
            mockService.getProjectProfitPool.mockResolvedValue(mockProfit);
            const result = await controller.getProjectProfitPool('project-id');
            expect(service.getProjectProfitPool).toHaveBeenCalledWith('project-id');
            expect(result).toEqual(mockProfit);
        });
    });

    describe('getUserProfitClaims', () => {
        it('should return user claims', async () => {
            mockService.getUserProfitClaims.mockResolvedValue([mockProfit]);
            const result = await controller.getUserProfitClaims('user-id');
            expect(service.getUserProfitClaims).toHaveBeenCalledWith('user-id');
            expect(result).toEqual([mockProfit]);
        });
    });
});
