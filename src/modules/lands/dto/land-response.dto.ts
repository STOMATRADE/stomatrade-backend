import { ApiProperty } from '@nestjs/swagger';

export class LandResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Associated farmer ID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  farmerId: string;

  @ApiProperty({
    description: 'NFT Token ID for the land',
    example: 2001,
  })
  tokenId: number;

  @ApiProperty({
    description: 'GPS Latitude coordinate',
    example: -6.2,
  })
  latitude: number;

  @ApiProperty({
    description: 'GPS Longitude coordinate',
    example: 106.816666,
  })
  longitude: number;

  @ApiProperty({
    description: 'Land address/location',
    example: 'Plot A1, Desa Makmur',
  })
  address: string;

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

export class LandWithRelationsDto extends LandResponseDto {
  @ApiProperty({
    description: 'Farmer data',
  })
  farmer?: any;

  @ApiProperty({
    description: 'List of projects on this land',
    type: 'array',
  })
  projects?: any[];
}

export class PaginatedLandResponseDto {
  @ApiProperty({
    description: 'List of lands',
    type: [LandResponseDto],
  })
  data: LandResponseDto[];

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
