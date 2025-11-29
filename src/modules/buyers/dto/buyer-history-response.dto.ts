import { ApiProperty } from '@nestjs/swagger';

export class BuyerHistoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'bb0e8400-e29b-41d4-a716-446655440006',
  })
  id: string;

  @ApiProperty({
    description: 'Associated buyer ID',
    example: 'aa0e8400-e29b-41d4-a716-446655440005',
  })
  buyerId: string;

  @ApiProperty({
    description: 'Number of successful transactions',
    example: 10,
  })
  buyerTransactionSuccess: number;

  @ApiProperty({
    description: 'Number of failed transactions',
    example: 2,
  })
  buyerTransactionFail: number;

  @ApiProperty({
    description: 'Buyer tier level',
    example: 'GOLD',
  })
  buyerTier: string;

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

export class PaginatedBuyerHistoryResponseDto {
  @ApiProperty({
    description: 'List of buyer histories',
    type: [BuyerHistoryResponseDto],
  })
  data: BuyerHistoryResponseDto[];

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
