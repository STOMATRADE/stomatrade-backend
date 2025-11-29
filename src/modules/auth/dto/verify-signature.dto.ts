import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifySignatureDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Signature from wallet signing the message',
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Message content that was signed (format: "Login StoMaTrade: <ISO timestamp>")',
    example: 'Login StoMaTrade: 2025-11-29T08:00:00.000Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}

