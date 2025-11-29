import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { LandResponseDto } from './dto/land-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LandsService {
  constructor(private prisma: PrismaService) {}

  async create(createLandDto: CreateLandDto): Promise<LandResponseDto> {
    return this.prisma.land.create({
      data: createLandDto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<LandResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.land.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.land.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<LandResponseDto> {
    const land = await this.prisma.land.findUnique({
      where: { id, deleted: false },
    });

    if (!land) {
      throw new NotFoundException(`Land with ID ${id} not found`);
    }

    return land;
  }

  async findByFarmer(farmerId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<LandResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.land.findMany({
        where: { farmerId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.land.count({ where: { farmerId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async update(id: string, updateLandDto: UpdateLandDto): Promise<LandResponseDto> {
    await this.findOne(id);

    return this.prisma.land.update({
      where: { id },
      data: updateLandDto,
    });
  }

  async remove(id: string): Promise<LandResponseDto> {
    await this.findOne(id);

    return this.prisma.land.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
