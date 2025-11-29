import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChannelNotificationDto } from './dto/create-channel-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateTokenNotificationDto } from './dto/create-token-notification.dto';
import { ChannelNotificationResponseDto, NotificationResponseDto, TokenNotificationResponseDto } from './dto/notification-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createChannel(createChannelDto: CreateChannelNotificationDto): Promise<ChannelNotificationResponseDto> {
    return this.prisma.channelNotification.create({
      data: createChannelDto,
    });
  }

  async findAllChannels(pagination: PaginationDto): Promise<PaginatedResponseDto<ChannelNotificationResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.channelNotification.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.channelNotification.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOneChannel(id: string): Promise<ChannelNotificationResponseDto> {
    const channel = await this.prisma.channelNotification.findUnique({
      where: { id, deleted: false },
    });

    if (!channel) {
      throw new NotFoundException(`Channel notification with ID ${id} not found`);
    }

    return channel;
  }

  async removeChannel(id: string): Promise<ChannelNotificationResponseDto> {
    await this.findOneChannel(id);

    return this.prisma.channelNotification.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findAllNotifications(pagination: PaginationDto): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOneNotification(id: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id, deleted: false },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async removeNotification(id: string): Promise<NotificationResponseDto> {
    await this.findOneNotification(id);

    return this.prisma.notification.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async createTokenNotification(createTokenDto: CreateTokenNotificationDto): Promise<TokenNotificationResponseDto> {
    return this.prisma.tokenNotification.create({
      data: createTokenDto,
    });
  }

  async findTokenNotificationsByUser(userId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<TokenNotificationResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.tokenNotification.findMany({
        where: { userId, deleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tokenNotification.count({ where: { userId, deleted: false } }),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async removeTokenNotification(id: string): Promise<TokenNotificationResponseDto> {
    const tokenNotification = await this.prisma.tokenNotification.findUnique({
      where: { id },
    });

    if (!tokenNotification) {
      throw new NotFoundException(`Token notification with ID ${id} not found`);
    }

    return this.prisma.tokenNotification.update({
      where: { id },
      data: { deleted: true },
    });
  }
}
