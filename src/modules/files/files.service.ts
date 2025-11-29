import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create(createFileDto: CreateFileDto): Promise<FileResponseDto> {
    return this.prisma.file.create({
      data: createFileDto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<FileResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findUnique({
      where: { id, deleted: false },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async findByReffId(reffId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<FileResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { reffId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where: { reffId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async remove(id: string): Promise<FileResponseDto> {
    await this.findOne(id);

    return this.prisma.file.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
