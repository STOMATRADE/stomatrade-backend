import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'User role',
    enum: ROLES,
    example: 'INVESTOR',
  })
  role: ROLES;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  deleted: boolean;
}

export class UserWithRelationsDto extends UserResponseDto {
  @ApiProperty({
    description: 'Collector profile if user is a collector',
    required: false,
  })
  collector?: any;

  @ApiProperty({
    description: 'User investments',
    type: 'array',
    required: false,
  })
  investments?: any[];

  @ApiProperty({
    description: 'Investment portfolios',
    type: 'array',
    required: false,
  })
  portfolios?: any[];
}

export class PaginatedUserResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

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
