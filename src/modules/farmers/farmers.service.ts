import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { FarmerResponseDto } from './dto/farmer-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';
import { retry } from 'rxjs';

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async create(createFarmerDto: CreateFarmerDto): Promise<FarmerResponseDto> {
    try {
      const res =await this.prisma.farmer.create({
        data: createFarmerDto,
      });

      return {
        ...res
      }
    } catch (error) {
      throw new Error(error.message);
    }
    
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<FarmerResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.farmer.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.farmer.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<FarmerResponseDto> {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id, deleted: false },
    });

    if (!farmer) {
      throw new NotFoundException(`Farmer with ID ${id} not found`);
    }

    return farmer;
  }

  async findByCollector(collectorId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<FarmerResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.farmer.findMany({
        where: { collectorId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.farmer.count({ where: { collectorId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async update(id: string, updateFarmerDto: UpdateFarmerDto): Promise<FarmerResponseDto> {
    await this.findOne(id);

    return this.prisma.farmer.update({
      where: { id },
      data: updateFarmerDto,
    });
  }

  async remove(id: string): Promise<FarmerResponseDto> {
    await this.findOne(id);

    return this.prisma.farmer.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
