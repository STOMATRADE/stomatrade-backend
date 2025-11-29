import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { BuyerResponseDto } from './dto/buyer-response.dto';
import { CreateBuyerHistoryDto } from './dto/create-buyer-history.dto';
import { UpdateBuyerHistoryDto } from './dto/update-buyer-history.dto';
import { BuyerHistoryResponseDto } from './dto/buyer-history-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BuyersService {
  constructor(private prisma: PrismaService) {}

  async create(createBuyerDto: CreateBuyerDto): Promise<BuyerResponseDto> {
    return this.prisma.buyer.create({
      data: createBuyerDto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<BuyerResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.buyer.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.buyer.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<BuyerResponseDto> {
    const buyer = await this.prisma.buyer.findUnique({
      where: { id, deleted: false },
    });

    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }

    return buyer;
  }

  async update(id: string, updateBuyerDto: UpdateBuyerDto): Promise<BuyerResponseDto> {
    await this.findOne(id);

    return this.prisma.buyer.update({
      where: { id },
      data: updateBuyerDto,
    });
  }

  async remove(id: string): Promise<BuyerResponseDto> {
    await this.findOne(id);

    return this.prisma.buyer.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async createHistory(createBuyerHistoryDto: CreateBuyerHistoryDto): Promise<BuyerHistoryResponseDto> {
    return this.prisma.buyerHistory.create({
      data: createBuyerHistoryDto,
    });
  }

  async findHistoryByBuyer(buyerId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<BuyerHistoryResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.buyerHistory.findMany({
        where: { buyerId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.buyerHistory.count({ where: { buyerId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOneHistory(id: string): Promise<BuyerHistoryResponseDto> {
    const history = await this.prisma.buyerHistory.findUnique({
      where: { id, deleted: false },
    });

    if (!history) {
      throw new NotFoundException(`Buyer history with ID ${id} not found`);
    }

    return history;
  }

  async updateHistory(id: string, updateBuyerHistoryDto: UpdateBuyerHistoryDto): Promise<BuyerHistoryResponseDto> {
    await this.findOneHistory(id);

    return this.prisma.buyerHistory.update({
      where: { id },
      data: updateBuyerHistoryDto,
    });
  }

  async removeHistory(id: string): Promise<BuyerHistoryResponseDto> {
    await this.findOneHistory(id);

    return this.prisma.buyerHistory.update({
      where: { id },
      data: { deleted: true },
    });
  }
}