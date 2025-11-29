import { ApiProperty } from '@nestjs/swagger';

export class CollectorResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'NIK (Nomor Induk Kependudukan)',
    example: '3201234567890123',
  })
  nik: string;

  @ApiProperty({
    description: 'Collector name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Collector address',
    example: 'Jl. Raya No. 123, Jakarta',
  })
  address: string;

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

export class CollectorWithFarmersDto extends CollectorResponseDto {
  @ApiProperty({
    description: 'List of farmers under this collector',
    type: 'array',
  })
  farmers?: any[];

  @ApiProperty({
    description: 'Associated user data',
  })
  user?: any;
}

export class PaginatedCollectorResponseDto {
  @ApiProperty({
    description: 'List of collectors',
    type: [CollectorResponseDto],
  })
  data: CollectorResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
