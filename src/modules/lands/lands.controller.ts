import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { LandResponseDto, PaginatedLandResponseDto } from './dto/land-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Lands')
@ApiBearerAuth('JWT-auth')
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Roles(ROLES.COLLECTOR, ROLES.STAFF, ROLES.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new land (Collector/Staff/Admin only)',
    description: 'Register a new land plot for a farmer with GPS coordinates',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Land created successfully',
    type: LandResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Farmer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() createLandDto: CreateLandDto): Promise<LandResponseDto> {
    return this.landsService.create(createLandDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all lands (Staff/Admin only)',
    description: 'Retrieve paginated list of all land plots',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lands retrieved successfully',
    type: PaginatedLandResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedLandResponseDto> {
    return this.landsService.findAll(pagination);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: 'Get lands by farmer',
    description: 'Retrieve all lands owned by a specific farmer',
  })
  @ApiParam({
    name: 'farmerId',
    description: 'Farmer UUID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lands retrieved successfully',
    type: PaginatedLandResponseDto,
  })
  findByFarmer(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedLandResponseDto> {
    return this.landsService.findByFarmer(farmerId, pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get land by ID',
    description: 'Retrieve a single land plot by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Land UUID',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Land retrieved successfully',
    type: LandResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Land not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<LandResponseDto> {
    return this.landsService.findOne(id);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update land (Staff/Admin only)',
    description: 'Update land coordinates or address',
  })
  @ApiParam({
    name: 'id',
    description: 'Land UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Land updated successfully',
    type: LandResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Land not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLandDto: UpdateLandDto,
  ): Promise<LandResponseDto> {
    return this.landsService.update(id, updateLandDto);
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete land (Admin only)',
    description: 'Soft delete a land plot',
  })
  @ApiParam({
    name: 'id',
    description: 'Land UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Land deleted successfully',
    type: LandResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Land not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<LandResponseDto> {
    return this.landsService.remove(id);
  }
}