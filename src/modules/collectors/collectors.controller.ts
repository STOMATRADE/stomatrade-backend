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
import { CollectorsService } from './collectors.service';
import { CreateCollectorDto } from './dto/create-collector.dto';
import { UpdateCollectorDto } from './dto/update-collector.dto';
import {
  CollectorResponseDto,
  PaginatedCollectorResponseDto,
} from './dto/collector-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Collectors')
@ApiBearerAuth('JWT-auth')
@Controller('collectors')
export class CollectorsController {
  constructor(private readonly collectorsService: CollectorsService) {}

  @Roles(ROLES.ADMIN, ROLES.STAFF, ROLES.COLLECTOR)
  @Post()
  @ApiOperation({
    summary: 'Create a new collector (Admin/Staff/Collector only)',
    description: 'Register a new collector profile linked to a user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Collector created successfully',
    type: CollectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or NIK already exists',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() createCollectorDto: CreateCollectorDto): Promise<CollectorResponseDto> {
    return this.collectorsService.create(createCollectorDto);
  }

  @Roles(ROLES.ADMIN, ROLES.STAFF)
  @Get()
  @ApiOperation({
    summary: 'Get all collectors (Admin/Staff only)',
    description: 'Retrieve paginated list of all collectors',
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
    description: 'Collectors retrieved successfully',
    type: PaginatedCollectorResponseDto,
  })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedCollectorResponseDto> {
    return this.collectorsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get collector by ID',
    description: 'Retrieve a single collector by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Collector UUID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collector retrieved successfully',
    type: CollectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collector not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CollectorResponseDto> {
    return this.collectorsService.findOne(id);
  }

  @Roles(ROLES.ADMIN, ROLES.STAFF)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update collector (Admin/Staff only)',
    description: 'Update collector name and/or address',
  })
  @ApiParam({
    name: 'id',
    description: 'Collector UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collector updated successfully',
    type: CollectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collector not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCollectorDto: UpdateCollectorDto,
  ): Promise<CollectorResponseDto> {
    return this.collectorsService.update(id, updateCollectorDto);
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete collector (Admin only)',
    description: 'Soft delete a collector',
  })
  @ApiParam({
    name: 'id',
    description: 'Collector UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Collector deleted successfully',
    type: CollectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collector not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<CollectorResponseDto> {
    return this.collectorsService.remove(id);
  }
}