import { Test, TestingModule } from '@nestjs/testing';
import { FarmerSubmissionsController } from './farmer-submissions.controller';
import { FarmerSubmissionsService } from './farmer-submissions.service';
import { CreateFarmerSubmissionDto } from './dto/create-farmer-submission.dto';
import { ApproveFarmerSubmissionDto } from './dto/approve-farmer-submission.dto';
import { RejectFarmerSubmissionDto } from './dto/reject-farmer-submission.dto';
import { SUBMISSION_STATUS } from '@prisma/client';

describe('FarmerSubmissionsController', () => {
    let controller: FarmerSubmissionsController;
    let service: FarmerSubmissionsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        approve: jest.fn(),
        reject: jest.fn(),
    };

    const mockSubmission = {
        id: 'submission-uuid-1',
        farmerId: 'farmer-uuid-1',
        status: SUBMISSION_STATUS.SUBMITTED,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FarmerSubmissionsController],
            providers: [
                {
                    provide: FarmerSubmissionsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<FarmerSubmissionsController>(FarmerSubmissionsController);
        service = module.get<FarmerSubmissionsService>(FarmerSubmissionsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a submission', async () => {
            const dto: CreateFarmerSubmissionDto = {
                farmerId: 'farmer-uuid-1',
                commodity: 'Coffee',
                submittedBy: '0xAddress',
            };
            mockService.create.mockResolvedValue(mockSubmission);

            const result = await controller.create(dto, 4202);

            expect(service.create).toHaveBeenCalledWith(dto, 4202);
            expect(result).toEqual(mockSubmission);
        });
    });

    describe('findAll', () => {
        it('should return all submissions', async () => {
            mockService.findAll.mockResolvedValue([mockSubmission]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockSubmission]);
        });
    });

    describe('findOne', () => {
        it('should return a submission', async () => {
            mockService.findOne.mockResolvedValue(mockSubmission);

            const result = await controller.findOne('submission-uuid-1');

            expect(service.findOne).toHaveBeenCalledWith('submission-uuid-1');
            expect(result).toEqual(mockSubmission);
        });
    });

    describe('approve', () => {
        it('should approve a submission', async () => {
            const dto: ApproveFarmerSubmissionDto = { approvedBy: '0xAdmin' };
            const approvedSubmission = { ...mockSubmission, status: SUBMISSION_STATUS.APPROVED };
            mockService.approve.mockResolvedValue(approvedSubmission);

            const result = await controller.approve('submission-uuid-1', dto, 4202);

            expect(service.approve).toHaveBeenCalledWith('submission-uuid-1', dto, 4202);
            expect(result).toEqual(approvedSubmission);
        });
    });

    describe('reject', () => {
        it('should reject a submission', async () => {
            const dto: RejectFarmerSubmissionDto = { rejectedBy: '0xAdmin', rejectionReason: 'Reason' };
            const rejectedSubmission = { ...mockSubmission, status: SUBMISSION_STATUS.REJECTED };
            mockService.reject.mockResolvedValue(rejectedSubmission);

            const result = await controller.reject('submission-uuid-1', dto);

            expect(service.reject).toHaveBeenCalledWith('submission-uuid-1', dto);
            expect(result).toEqual(rejectedSubmission);
        });
    });
});
