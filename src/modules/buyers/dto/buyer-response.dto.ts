import { ApiProperty } from '@nestjs/swagger';

export class BuyerResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'aa0e8400-e29b-41d4-a716-446655440005',
  })
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'PT Agro Makmur',
  })
  companyName: string;

  @ApiProperty({
    description: 'Company address',
    example: 'Jl. Industri No. 789, Surabaya',
  })
  companyAddress: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '081234567890',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Company email',
    example: 'info@agromakmur.com',
  })
  companyMail: string;

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

export class PaginatedBuyerResponseDto {
  @ApiProperty({
    description: 'List of buyers',
    type: [BuyerResponseDto],
  })
  data: BuyerResponseDto[];

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
