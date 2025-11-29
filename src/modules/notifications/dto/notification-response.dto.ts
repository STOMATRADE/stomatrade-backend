import { ApiProperty } from '@nestjs/swagger';

export class ChannelNotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'dd0e8400-e29b-41d4-a716-446655440008',
  })
  id: string;

  @ApiProperty({
    description: 'Unique key identifier',
    example: 'project_updates',
  })
  key: string;

  @ApiProperty({
    description: 'Channel description',
    example: 'Channel for project-related updates',
  })
  desc: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete flag', example: false })
  deleted: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'ee0e8400-e29b-41d4-a716-446655440009',
  })
  id: string;

  @ApiProperty({
    description: 'Associated channel ID',
    example: 'dd0e8400-e29b-41d4-a716-446655440008',
  })
  channelId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Project Available',
  })
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'A new rice project has been added to your area',
  })
  body: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete flag', example: false })
  deleted: boolean;
}

export class TokenNotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'ff0e8400-e29b-41d4-a716-446655440010',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'FCM token',
    example: 'fcm_token_abc123xyz',
  })
  tokenId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete flag', example: false })
  deleted: boolean;
}

export class PaginatedChannelResponseDto {
  @ApiProperty({ type: [ChannelNotificationResponseDto] })
  data: ChannelNotificationResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginatedNotificationResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data: NotificationResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginatedTokenResponseDto {
  @ApiProperty({ type: [TokenNotificationResponseDto] })
  data: TokenNotificationResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
