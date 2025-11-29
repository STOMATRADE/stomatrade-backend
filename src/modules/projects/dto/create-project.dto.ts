import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'NFT Token ID (optional, set after blockchain minting)',
    example: 3001,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    description: 'Type of commodity (e.g., Rice, Coffee, Corn)',
    example: 'Rice',
  })
  @IsString()
  @IsNotEmpty()
  commodity: string;

  @ApiProperty({
    description: 'Volume in units (kg, tons, etc.)',
    example: 1000.5,
  })
  @IsNumber()
  @Min(0.1)
  volume: number;

  @ApiProperty({
    description: 'Quality grade (A, B, C, A+, Premium)',
    example: 'A',
  })
  @IsString()
  @IsNotEmpty()
  gradeQuality: string;

  @ApiProperty({
    description: 'Associated farmer ID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId: string;

  @ApiProperty({
    description: 'Associated land ID',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsNotEmpty()
  landId: string;

  @ApiProperty({
    description: 'Expected send/delivery date (ISO 8601)',
    example: '2025-02-15T08:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  sendDate: string;
}
