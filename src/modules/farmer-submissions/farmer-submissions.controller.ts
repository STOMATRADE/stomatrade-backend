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
import { FarmerSubmissionsService } from './farmer-submissions.service';
import { CreateFarmerSubmissionDto } from './dto/create-farmer-submission.dto';
import { ApproveFarmerSubmissionDto } from './dto/approve-farmer-submission.dto';
import { RejectFarmerSubmissionDto } from './dto/reject-farmer-submission.dto';
import { FarmerSubmissionResponseDto } from './dto/farmer-submission-response.dto';
import { SUBMISSION_STATUS, ROLES } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Farmer Submissions')
@ApiBearerAuth('JWT-auth')
@Controller('farmer-submissions')
export class FarmerSubmissionsController {
  constructor(
    private readonly farmerSubmissionsService: FarmerSubmissionsService,
  ) {}

  @Roles(ROLES.COLLECTOR, ROLES.STAFF, ROLES.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Submit farmer for NFT minting approval (Collector/Staff/Admin only)',
    description:
      'Collector submits a farmer for platform approval before NFT minting',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Farmer submission created successfully',
    type: FarmerSubmissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Farmer already has a submission',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Farmer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() dto: CreateFarmerSubmissionDto) {
    return this.farmerSubmissionsService.create(dto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all farmer submissions (Staff/Admin only)',
    description: 'Retrieve all farmer submissions with optional status filter',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SUBMISSION_STATUS,
    description: 'Filter by submission status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Farmer submissions retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAll(@Query('status') status?: SUBMISSION_STATUS) {
    return this.farmerSubmissionsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get farmer submission by ID (authenticated users)',
    description: 'Retrieve a single farmer submission',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Farmer submission retrieved successfully',
    type: FarmerSubmissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Farmer submission not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  findOne(@Param('id') id: string) {
    return this.farmerSubmissionsService.findOne(id);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve farmer submission and mint NFT (Admin only)',
    description:
      'Platform admin approves the submission and triggers blockchain NFT minting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Farmer submission approved and NFT minted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot approve submission or NFT minting failed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Farmer submission not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  approve(@Param('id') id: string, @Body() dto: ApproveFarmerSubmissionDto) {
    return this.farmerSubmissionsService.approve(id, dto);
  }

  @Roles(ROLES.ADMIN)
  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject farmer submission (Admin only)',
    description: 'Platform admin rejects the farmer submission',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Farmer submission rejected successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot reject submission',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Farmer submission not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  reject(@Param('id') id: string, @Body() dto: RejectFarmerSubmissionDto) {
    return this.farmerSubmissionsService.reject(id, dto);
  }
}