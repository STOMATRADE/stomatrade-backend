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
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { CreateBuyerHistoryDto } from './dto/create-buyer-history.dto';
import { UpdateBuyerHistoryDto } from './dto/update-buyer-history.dto';
import { BuyerResponseDto, PaginatedBuyerResponseDto } from './dto/buyer-response.dto';
import {
  BuyerHistoryResponseDto,
  PaginatedBuyerHistoryResponseDto,
} from './dto/buyer-history-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Buyers')
@ApiBearerAuth('JWT-auth')
@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  // ============ BUYER ENDPOINTS ============

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create a new buyer (Staff/Admin only)',
    description: 'Register a new buyer/company',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Buyer created successfully',
    type: BuyerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or email already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() createBuyerDto: CreateBuyerDto): Promise<BuyerResponseDto> {
    return this.buyersService.create(createBuyerDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all buyers (Staff/Admin only)',
    description: 'Retrieve paginated list of all buyers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buyers retrieved successfully',
    type: PaginatedBuyerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAll(@Query() pagination: PaginationDto): Promise<PaginatedBuyerResponseDto> {
    return this.buyersService.findAll(pagination);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get buyer by ID (Staff/Admin only)',
    description: 'Retrieve a single buyer by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Buyer UUID',
    example: 'aa0e8400-e29b-41d4-a716-446655440005',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buyer retrieved successfully',
    type: BuyerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Buyer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BuyerResponseDto> {
    return this.buyersService.findOne(id);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update buyer (Staff/Admin only)',
    description: 'Update buyer information',
  })
  @ApiParam({ name: 'id', description: 'Buyer UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buyer updated successfully',
    type: BuyerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Buyer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBuyerDto: UpdateBuyerDto,
  ): Promise<BuyerResponseDto> {
    return this.buyersService.update(id, updateBuyerDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete buyer (Staff/Admin only)',
    description: 'Soft delete a buyer',
  })
  @ApiParam({ name: 'id', description: 'Buyer UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buyer deleted successfully',
    type: BuyerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Buyer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<BuyerResponseDto> {
    return this.buyersService.remove(id);
  }

  // ============ BUYER HISTORY ENDPOINTS ============

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Post('history')
  @ApiOperation({
    summary: 'Create buyer history (Staff/Admin only)',
    description: 'Add a new history record for a buyer',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Buyer history created successfully',
    type: BuyerHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Buyer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  createHistory(
    @Body() createBuyerHistoryDto: CreateBuyerHistoryDto,
  ): Promise<BuyerHistoryResponseDto> {
    return this.buyersService.createHistory(createBuyerHistoryDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get(':buyerId/history')
  @ApiOperation({
    summary: 'Get buyer history (Staff/Admin only)',
    description: 'Retrieve history records for a specific buyer',
  })
  @ApiParam({
    name: 'buyerId',
    description: 'Buyer UUID',
    example: 'aa0e8400-e29b-41d4-a716-446655440005',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Buyer history retrieved successfully',
    type: PaginatedBuyerHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findHistoryByBuyer(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedBuyerHistoryResponseDto> {
    return this.buyersService.findHistoryByBuyer(buyerId, pagination);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get('history/:id')
  @ApiOperation({
    summary: 'Get buyer history by ID (Staff/Admin only)',
    description: 'Retrieve a single history record',
  })
  @ApiParam({
    name: 'id',
    description: 'History record UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'History retrieved successfully',
    type: BuyerHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'History not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findOneHistory(@Param('id', ParseUUIDPipe) id: string): Promise<BuyerHistoryResponseDto> {
    return this.buyersService.findOneHistory(id);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Patch('history/:id')
  @ApiOperation({
    summary: 'Update buyer history (Staff/Admin only)',
    description: 'Update a history record',
  })
  @ApiParam({ name: 'id', description: 'History record UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'History updated successfully',
    type: BuyerHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'History not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  updateHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBuyerHistoryDto: UpdateBuyerHistoryDto,
  ): Promise<BuyerHistoryResponseDto> {
    return this.buyersService.updateHistory(id, updateBuyerHistoryDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Delete('history/:id')
  @ApiOperation({
    summary: 'Delete buyer history (Staff/Admin only)',
    description: 'Soft delete a history record',
  })
  @ApiParam({ name: 'id', description: 'History record UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'History deleted successfully',
    type: BuyerHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'History not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  removeHistory(@Param('id', ParseUUIDPipe) id: string): Promise<BuyerHistoryResponseDto> {
    return this.buyersService.removeHistory(id);
  }
}
