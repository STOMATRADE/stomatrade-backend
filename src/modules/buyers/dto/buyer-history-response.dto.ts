import { ApiProperty } from '@nestjs/swagger';

export class BuyerHistoryResponseDto {
  @ApiProperty({example: 'bb0e8400-e29b-41d4-a716-446655440006',})
  id: string;

  @ApiProperty({example: 'aa0e8400-e29b-41d4-a716-446655440005',})
  buyerId: string;

  @ApiProperty({example: 10,})
  buyerTransactionSuccess: number;

  @ApiProperty({example: 2,})
  buyerTransactionFail: number;

  @ApiProperty({example: 'GOLD',})
  buyerTier: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class PaginatedBuyerHistoryResponseDto {
  @ApiProperty({type: [BuyerHistoryResponseDto],})
  items: BuyerHistoryResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
