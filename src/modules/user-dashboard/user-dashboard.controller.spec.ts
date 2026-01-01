import { Test, TestingModule } from '@nestjs/testing';
import { UserDashboardController } from './user-dashboard.controller';
import { UserDashboardService } from './user-dashboard.service';

describe('UserDashboardController', () => {
    let controller: UserDashboardController;
    let service: UserDashboardService;

    const mockService = {
        getUserCash: jest.fn(),
        getUserAssets: jest.fn(),
        getUserTotalDashboard: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserDashboardController],
            providers: [{ provide: UserDashboardService, useValue: mockService }],
        }).compile();

        controller = module.get<UserDashboardController>(UserDashboardController);
        service = module.get<UserDashboardService>(UserDashboardService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getUserCash', () => {
        it('should return cash', async () => {
            mockService.getUserCash.mockResolvedValue({});
            expect(await controller.getUserCash('user-id')).toEqual({});
        });
    });

    describe('getUserAssets', () => {
        it('should return assets', async () => {
            mockService.getUserAssets.mockResolvedValue({});
            expect(await controller.getUserAssets('user-id')).toEqual({});
        });
    });
});
