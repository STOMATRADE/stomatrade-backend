import { Test, TestingModule } from '@nestjs/testing';
import { ProjectSubmissionsController } from './project-submissions.controller';
import { ProjectSubmissionsService } from './project-submissions.service';
import { CreateProjectSubmissionDto } from './dto/create-project-submission.dto';
import { ApproveProjectSubmissionDto } from './dto/approve-project-submission.dto';
import { RejectProjectSubmissionDto } from './dto/reject-project-submission.dto';
import { SUBMISSION_STATUS } from '@prisma/client';

describe('ProjectSubmissionsController', () => {
    let controller: ProjectSubmissionsController;
    let service: ProjectSubmissionsService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        approve: jest.fn(),
        reject: jest.fn(),
    };

    const mockSubmission = {
        id: 'submission-uuid-1',
        projectId: 'project-uuid-1',
        status: SUBMISSION_STATUS.SUBMITTED,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectSubmissionsController],
            providers: [
                {
                    provide: ProjectSubmissionsService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<ProjectSubmissionsController>(ProjectSubmissionsController);
        service = module.get<ProjectSubmissionsService>(ProjectSubmissionsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a submission', async () => {
            const dto: CreateProjectSubmissionDto = {
                projectId: 'project-uuid-1',
                valueProject: '1000',
                maxCrowdFunding: '500',
                submittedBy: '0xAddress',
            };
            mockService.create.mockResolvedValue(mockSubmission);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
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

        it('should filter by status', async () => {
            mockService.findAll.mockResolvedValue([mockSubmission]);

            const result = await controller.findAll(SUBMISSION_STATUS.SUBMITTED);

            expect(service.findAll).toHaveBeenCalledWith(SUBMISSION_STATUS.SUBMITTED);
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
            const dto: ApproveProjectSubmissionDto = { approvedBy: '0xAdmin' };
            const approvedSubmission = { ...mockSubmission, status: SUBMISSION_STATUS.APPROVED };
            mockService.approve.mockResolvedValue(approvedSubmission);

            const result = await controller.approve('submission-uuid-1', dto, 4202);

            expect(service.approve).toHaveBeenCalledWith('submission-uuid-1', dto, 4202);
            expect(result).toEqual(approvedSubmission);
        });
    });

    describe('reject', () => {
        it('should reject a submission', async () => {
            const dto: RejectProjectSubmissionDto = { rejectedBy: '0xAdmin', rejectionReason: 'Reason' };
            const rejectedSubmission = { ...mockSubmission, status: SUBMISSION_STATUS.REJECTED };
            mockService.reject.mockResolvedValue(rejectedSubmission);

            const result = await controller.reject('submission-uuid-1', dto);

            expect(service.reject).toHaveBeenCalledWith('submission-uuid-1', dto);
            expect(result).toEqual(rejectedSubmission);
        });
    });
});
