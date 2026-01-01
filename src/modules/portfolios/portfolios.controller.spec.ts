import { Test, TestingModule } from '@nestjs/testing';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';

describe('PortfoliosController', () => {
    let controller: PortfoliosController;
    let service: PortfoliosService;

    const mockService = {
        getGlobalStats: jest.fn(),
        getTopInvestors: jest.fn(),
        getAllPortfolios: jest.fn(),
        getUserPortfolio: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PortfoliosController],
            providers: [{ provide: PortfoliosService, useValue: mockService }],
        }).compile();

        controller = module.get<PortfoliosController>(PortfoliosController);
        service = module.get<PortfoliosService>(PortfoliosService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getGlobalStats', () => {
        it('should return stats', async () => {
            mockService.getGlobalStats.mockResolvedValue({});
            expect(await controller.getGlobalStats()).toEqual({});
        });
    });

    describe('getTopInvestors', () => {
        it('should return top investors', async () => {
            mockService.getTopInvestors.mockResolvedValue([]);
            expect(await controller.getTopInvestors(10)).toEqual([]);
        });
    });
});
