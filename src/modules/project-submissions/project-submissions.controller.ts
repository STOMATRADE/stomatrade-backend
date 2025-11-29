import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectSubmissionsService } from './project-submissions.service';
import { CreateProjectSubmissionDto } from './dto/create-project-submission.dto';
import { ApproveProjectSubmissionDto } from './dto/approve-project-submission.dto';
import { RejectProjectSubmissionDto } from './dto/reject-project-submission.dto';
import { SUBMISSION_STATUS, ROLES } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Project Submissions')
@ApiBearerAuth('JWT-auth')
@Controller('project-submissions')
export class ProjectSubmissionsController {
  constructor(
    private readonly projectSubmissionsService: ProjectSubmissionsService,
  ) {}

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Submit project for NFT minting approval (Staff/Admin only)',
    description:
      'Staff submits a project for platform approval before blockchain NFT minting',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project submission created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Project already has a submission',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() dto: CreateProjectSubmissionDto) {
    return this.projectSubmissionsService.create(dto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all project submissions (Staff/Admin only)',
    description:
      'Retrieve all project submissions with optional status filter',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SUBMISSION_STATUS,
    description: 'Filter by submission status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project submissions retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAll(@Query('status') status?: SUBMISSION_STATUS) {
    return this.projectSubmissionsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project submission by ID (authenticated users)',
    description: 'Retrieve a single project submission',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project submission retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project submission not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  findOne(@Param('id') id: string) {
    return this.projectSubmissionsService.findOne(id);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve project submission and mint NFT (Admin only)',
    description:
      'Platform admin approves the submission and triggers blockchain Project NFT minting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project submission approved and NFT minted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot approve submission or NFT minting failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project submission not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveProjectSubmissionDto,
  ) {
    return this.projectSubmissionsService.approve(id, dto);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject project submission (Admin only)',
    description: 'Platform admin rejects the project submission',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project submission rejected successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot reject submission',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project submission not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  reject(@Param('id') id: string, @Body() dto: RejectProjectSubmissionDto) {
    return this.projectSubmissionsService.reject(id, dto);
  }
}
