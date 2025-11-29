import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const { sendDate, ...rest } = createProjectDto;

    const res = await this.prisma.project.create({
      data: {
        ...rest,
        sendDate: new Date(sendDate),
      },
    });

    return {
      ...res
    }
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id, deleted: false },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async findByFarmer(farmerId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { farmerId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where: { farmerId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findByLand(landId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { landId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where: { landId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponseDto> {
    await this.findOne(id);

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.sendDate) {
      updateData.sendDate = new Date(updateProjectDto.sendDate);
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<ProjectResponseDto> {
    await this.findOne(id);

    const res = await this.prisma.project.update({
      where: { id },
      data: { deleted: true },
    });

    return res;
  }
}
