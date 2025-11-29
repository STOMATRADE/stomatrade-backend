import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBuyerHistoryDto {
  @ApiProperty({
    description: 'Number of successful transactions',
    example: 11,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionSuccess?: number;

  @ApiProperty({
    description: 'Number of failed transactions',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionFail?: number;

  @ApiProperty({
    description: 'Buyer tier level',
    example: 'PLATINUM',
    required: false,
  })
  @IsString()
  @IsOptional()
  buyerTier?: string;
}
