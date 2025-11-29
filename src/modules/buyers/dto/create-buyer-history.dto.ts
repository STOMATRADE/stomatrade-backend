import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateBuyerHistoryDto {
  @ApiProperty({example: 'aa0e8400-e29b-41d4-a716-446655440005',})
  @IsUUID()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({example: 10,
    default: 0,})
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionSuccess?: number = 0;

  @ApiProperty({example: 2,
    default: 0,})
  @IsInt()
  @Min(0)
  @IsOptional()
  buyerTransactionFail?: number = 0;

  @ApiProperty({example: 'GOLD',})
  @IsString()
  @IsNotEmpty()
  buyerTier: string;
}
