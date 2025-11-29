import { ApiProperty } from '@nestjs/swagger';

export class ChannelNotificationResponseDto {
  @ApiProperty({example: 'dd0e8400-e29b-41d4-a716-446655440008',})
  id: string;

  @ApiProperty({example: 'project_updates',})
  key: string;

  @ApiProperty({example: 'Channel for project-related updates',})
  desc: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false})
  deleted: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({example: 'ee0e8400-e29b-41d4-a716-446655440009',})
  id: string;

  @ApiProperty({example: 'dd0e8400-e29b-41d4-a716-446655440008',})
  channelId: string;

  @ApiProperty({example: 'New Project Available',})
  title: string;

  @ApiProperty({example: 'A new rice project has been added to your area',})
  body: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false})
  deleted: boolean;
}

export class TokenNotificationResponseDto {
  @ApiProperty({example: 'ff0e8400-e29b-41d4-a716-446655440010',})
  id: string;

  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  userId: string;

  @ApiProperty({example: 'fcm_token_abc123xyz',})
  tokenId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false})
  deleted: boolean;
}

export class PaginatedChannelResponseDto {
  @ApiProperty({ type: [ChannelNotificationResponseDto] })
  items: ChannelNotificationResponseDto[];

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
  items: NotificationResponseDto[];

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
  items: TokenNotificationResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
