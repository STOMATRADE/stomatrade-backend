import { Test, TestingModule } from '@nestjs/testing';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';
import { MarkRefundableDto } from './dto/mark-refundable.dto';
import { ClaimRefundDto } from './dto/claim-refund.dto';

describe('RefundsController', () => {
    let controller: RefundsController;
    let service: RefundsService;

    const mockService = {
        markRefundable: jest.fn(),
        claimRefund: jest.fn(),
        getRefundableProjects: jest.fn(),
        getUserRefundClaims: jest.fn(),
    };

    const mockRefund = {
        id: 'refund-id-1',
        amount: '1000',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RefundsController],
            providers: [
                {
                    provide: RefundsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<RefundsController>(RefundsController);
        service = module.get<RefundsService>(RefundsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('markRefundable', () => {
        it('should mark refundable', async () => {
            const dto: MarkRefundableDto = {
                projectId: 'project-id',
                reason: 'failed',
            };
            mockService.markRefundable.mockResolvedValue(mockRefund);

            const result = await controller.markRefundable(dto, 4202);

            expect(service.markRefundable).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockRefund);
        });
    });

    describe('claimRefund', () => {
        it('should claim refund', async () => {
            const dto: ClaimRefundDto = {
                projectId: 'project-id',
                userId: 'user-id',
            };
            mockService.claimRefund.mockResolvedValue(mockRefund);

            const result = await controller.claimRefund(dto, 4202);

            expect(service.claimRefund).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockRefund);
        });
    });

    describe('getRefundableProjects', () => {
        it('should return projects', async () => {
            mockService.getRefundableProjects.mockResolvedValue([mockRefund]);
            const result = await controller.getRefundableProjects();
            expect(service.getRefundableProjects).toHaveBeenCalled();
            expect(result).toEqual([mockRefund]);
        });
    });

    describe('getUserRefundClaims', () => {
        it('should return user claims', async () => {
            mockService.getUserRefundClaims.mockResolvedValue([mockRefund]);
            const result = await controller.getUserRefundClaims('user-id');
            expect(service.getUserRefundClaims).toHaveBeenCalledWith('user-id');
            expect(result).toEqual([mockRefund]);
        });
    });
});
