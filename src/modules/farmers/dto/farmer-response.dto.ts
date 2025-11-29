import { ApiProperty } from '@nestjs/swagger';
import { GENDER } from '@prisma/client';

export class FarmerResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Associated collector ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  collectorId: string;

  @ApiProperty({
    description: 'NFT Token ID (after minting)',
    example: 1001,
    nullable: true,
  })
  tokenId: number | null;

  @ApiProperty({
    description: 'NIK (Nomor Induk Kependudukan)',
    example: '3201234567890124',
  })
  nik: string;

  @ApiProperty({
    description: 'Farmer full name',
    example: 'Farmer Jane',
  })
  name: string;

  @ApiProperty({
    description: 'Farmer age',
    example: 35,
  })
  age: number;

  @ApiProperty({
    description: 'Farmer gender',
    enum: GENDER,
    example: 'FEMALE',
  })
  gender: GENDER;

  @ApiProperty({
    description: 'Farmer address',
    example: 'Desa Makmur, Kec. Subur',
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

export class FarmerWithRelationsDto extends FarmerResponseDto {
  @ApiProperty({
    description: 'Collector data',
  })
  collector?: any;

  @ApiProperty({
    description: 'List of lands owned by farmer',
    type: 'array',
  })
  lands?: any[];

  @ApiProperty({
    description: 'List of projects',
    type: 'array',
  })
  projects?: any[];

  @ApiProperty({
    description: 'Farmer submission status',
  })
  farmerSubmission?: any;
}

export class PaginatedFarmerResponseDto {
  @ApiProperty({
    description: 'List of farmers',
    type: [FarmerResponseDto],
  })
  data: FarmerResponseDto[];

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
