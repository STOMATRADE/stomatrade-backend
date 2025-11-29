import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'cc0e8400-e29b-41d4-a716-446655440007',
  })
  id: string;

  @ApiProperty({
    description: 'NFT Token ID (after minting on blockchain)',
    example: 3001,
    nullable: true,
  })
  tokenId: number | null;

  @ApiProperty({
    description: 'Commodity type',
    example: 'Rice',
  })
  commodity: string;

  @ApiProperty({
    description: 'Volume in units',
    example: 1000.5,
  })
  volume: number;

  @ApiProperty({
    description: 'Quality grade',
    example: 'A',
  })
  gradeQuality: string;

  @ApiProperty({
    description: 'Associated farmer ID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  farmerId: string;

  @ApiProperty({
    description: 'Associated land ID',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  landId: string;

  @ApiProperty({
    description: 'Expected send/delivery date',
    example: '2025-02-15T08:00:00.000Z',
  })
  sendDate: Date;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  deleted: boolean;
}

export class ProjectWithRelationsDto extends ProjectResponseDto {
  @ApiProperty({
    description: 'Farmer data',
  })
  farmer?: any;

  @ApiProperty({
    description: 'Land data',
  })
  land?: any;

  @ApiProperty({
    description: 'Project submission status',
  })
  projectSubmission?: any;

  @ApiProperty({
    description: 'List of investments',
    type: 'array',
  })
  investments?: any[];

  @ApiProperty({
    description: 'Profit pool data',
  })
  profitPool?: any;
}

export class PaginatedProjectResponseDto {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectResponseDto],
  })
  data: ProjectResponseDto[];

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
