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
import { NotificationsService } from './notifications.service';
import { CreateChannelNotificationDto } from './dto/create-channel-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateTokenNotificationDto } from './dto/create-token-notification.dto';
import {
  ChannelNotificationResponseDto,
  NotificationResponseDto,
  TokenNotificationResponseDto,
  PaginatedChannelResponseDto,
  PaginatedNotificationResponseDto,
  PaginatedTokenResponseDto,
} from './dto/notification-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ============ CHANNEL ENDPOINTS ============

  @Roles(ROLES.ADMIN)
  @Post('channels')
  @ApiOperation({
    summary: 'Create notification channel (Admin only)',
    description: 'Create a new notification channel',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Channel created successfully',
    type: ChannelNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or key already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  createChannel(
    @Body() createChannelDto: CreateChannelNotificationDto,
  ): Promise<ChannelNotificationResponseDto> {
    return this.notificationsService.createChannel(createChannelDto);
  }

  @Roles(ROLES.ADMIN)
  @Get('channels')
  @ApiOperation({
    summary: 'Get all channels (Admin only)',
    description: 'Retrieve paginated list of notification channels',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channels retrieved successfully',
    type: PaginatedChannelResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  findAllChannels(@Query() pagination: PaginationDto): Promise<PaginatedChannelResponseDto> {
    return this.notificationsService.findAllChannels(pagination);
  }

  @Roles(ROLES.ADMIN)
  @Get('channels/:id')
  @ApiOperation({
    summary: 'Get channel by ID (Admin only)',
    description: 'Retrieve a single notification channel',
  })
  @ApiParam({ name: 'id', description: 'Channel UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channel retrieved successfully',
    type: ChannelNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  findOneChannel(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ChannelNotificationResponseDto> {
    return this.notificationsService.findOneChannel(id);
  }

  @Roles(ROLES.ADMIN)
  @Delete('channels/:id')
  @ApiOperation({
    summary: 'Delete channel (Admin only)',
    description: 'Soft delete a notification channel',
  })
  @ApiParam({ name: 'id', description: 'Channel UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channel deleted successfully',
    type: ChannelNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  removeChannel(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ChannelNotificationResponseDto> {
    return this.notificationsService.removeChannel(id);
  }

  // ============ NOTIFICATION ENDPOINTS ============

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Create notification (Staff/Admin only)',
    description: 'Create a new notification in a channel',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all notifications (Staff/Admin only)',
    description: 'Retrieve paginated list of notifications',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notifications retrieved successfully',
    type: PaginatedNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findAllNotifications(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedNotificationResponseDto> {
    return this.notificationsService.findAllNotifications(pagination);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get notification by ID (Staff/Admin only)',
    description: 'Retrieve a single notification',
  })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification retrieved successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  findOneNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOneNotification(id);
  }

  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification (Staff/Admin only)',
    description: 'Soft delete a notification',
  })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification deleted successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  removeNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.removeNotification(id);
  }

  // ============ TOKEN ENDPOINTS ============

  @Post('tokens')
  @ApiOperation({
    summary: 'Register FCM token (authenticated users)',
    description: 'Register a Firebase Cloud Messaging token for push notifications',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token registered successfully',
    type: TokenNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  createTokenNotification(
    @Body() createTokenDto: CreateTokenNotificationDto,
  ): Promise<TokenNotificationResponseDto> {
    return this.notificationsService.createTokenNotification(createTokenDto);
  }

  @Get('tokens/user/:userId')
  @ApiOperation({
    summary: 'Get user tokens (authenticated users)',
    description: 'Retrieve FCM tokens for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens retrieved successfully',
    type: PaginatedTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  findTokenNotificationsByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedTokenResponseDto> {
    return this.notificationsService.findTokenNotificationsByUser(userId, pagination);
  }

  @Delete('tokens/:id')
  @ApiOperation({
    summary: 'Delete FCM token (authenticated users)',
    description: 'Soft delete an FCM token',
  })
  @ApiParam({ name: 'id', description: 'Token UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token deleted successfully',
    type: TokenNotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Token not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  removeTokenNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TokenNotificationResponseDto> {
    return this.notificationsService.removeTokenNotification(id);
  }
}
