import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  id: string;

  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',})
  walletAddress: string;

  @ApiProperty({enum: ROLES,
    example: 'INVESTOR',})
  role: ROLES;

  @ApiProperty({example: '2025-01-15T10:30:00.000Z',})
  createdAt: Date;

  @ApiProperty({example: '2025-01-15T10:30:00.000Z',})
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class UserWithRelationsDto extends UserResponseDto {
  @ApiProperty({required: false,})
  collector?: any;

  @ApiProperty({type: 'array',
    required: false,})
  investments?: any[];

  @ApiProperty({type: 'array',
    required: false,})
  portfolios?: any[];
}

export class PaginatedUserResponseDto {
  @ApiProperty({type: [UserResponseDto],})
  items: UserResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
