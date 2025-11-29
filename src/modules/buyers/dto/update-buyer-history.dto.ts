import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBuyerHistoryDto {
  @ApiProperty({example: 11,
    required: false,})
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionSuccess?: number;

  @ApiProperty({example: 2,
    required: false,})
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionFail?: number;

  @ApiProperty({example: 'PLATINUM',
    required: false,})
  @IsString()
  @IsOptional()
  buyerTier?: string;
}
