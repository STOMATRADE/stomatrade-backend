import { ApiProperty } from '@nestjs/swagger';

export class CollectorResponseDto {
  @ApiProperty({example: '660e8400-e29b-41d4-a716-446655440001',})
  id: string;

  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  userId: string;

  @ApiProperty({example: '3201234567890123',})
  nik: string;

  @ApiProperty({example: 'John Doe',})
  name: string;

  @ApiProperty({example: 'Jl. Raya No. 123, Jakarta',})
  address: string;

  @ApiProperty({example: '2025-01-15T10:30:00.000Z',})
  createdAt: Date;

  @ApiProperty({example: '2025-01-15T10:30:00.000Z',})
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class CollectorWithFarmersDto extends CollectorResponseDto {
  @ApiProperty({type: 'array',})
  farmers?: any[];

  @ApiProperty()
  user?: any;
}

export class PaginatedCollectorResponseDto {
  @ApiProperty({type: [CollectorResponseDto],})
  items: CollectorResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
