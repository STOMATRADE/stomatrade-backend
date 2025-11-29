import {
  Controller,
  Get,
  Post,
  Body,
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
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileResponseDto, PaginatedFileResponseDto } from './dto/file-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create file reference (authenticated users)',
    description: 'Store a file reference linked to an entity',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File reference created successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  create(@Body() createFileDto: CreateFileDto): Promise<FileResponseDto> {
    return this.filesService.create(createFileDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all files (Staff/Admin only)',
    description: 'Retrieve paginated list of all file references',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Files retrieved successfully',
    type: PaginatedFileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedFileResponseDto> {
    return this.filesService.findAll(pagination);
  }

  @Get('reference/:reffId')
  @ApiOperation({
    summary: 'Get files by reference',
    description: 'Retrieve all files linked to a specific entity',
  })
  @ApiParam({
    name: 'reffId',
    description: 'Reference entity UUID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Files retrieved successfully',
    type: PaginatedFileResponseDto,
  })
  findByReffId(
    @Param('reffId', ParseUUIDPipe) reffId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedFileResponseDto> {
    return this.filesService.findByReffId(reffId, pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get file by ID',
    description: 'Retrieve a single file reference by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'File UUID',
    example: '990e8400-e29b-41d4-a716-446655440004',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File retrieved successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponseDto> {
    return this.filesService.findOne(id);
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete file (Admin only)',
    description: 'Soft delete a file reference',
  })
  @ApiParam({
    name: 'id',
    description: 'File UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File deleted successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponseDto> {
    return this.filesService.remove(id);
  }
}