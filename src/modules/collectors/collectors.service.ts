import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollectorDto } from './dto/create-collector.dto';
import { UpdateCollectorDto } from './dto/update-collector.dto';
import { CollectorResponseDto } from './dto/collector-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CollectorsService {
  constructor(private prisma: PrismaService) {}

  async create(createCollectorDto: CreateCollectorDto): Promise<CollectorResponseDto> {
    return this.prisma.collector.create({
      data: createCollectorDto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<CollectorResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.collector.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collector.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<CollectorResponseDto> {
    const collector = await this.prisma.collector.findUnique({
      where: { id, deleted: false },
    });

    if (!collector) {
      throw new NotFoundException(`Collector with ID ${id} not found`);
    }

    return collector;
  }

  async update(id: string, updateCollectorDto: UpdateCollectorDto): Promise<CollectorResponseDto> {
    await this.findOne(id);

    return this.prisma.collector.update({
      where: { id },
      data: updateCollectorDto,
    });
  }

  async remove(id: string): Promise<CollectorResponseDto> {
    await this.findOne(id);

    return this.prisma.collector.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
