import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifySignatureDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    example: 'Login StoMaTrade: 2025-11-29T08:00:00.000Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}

