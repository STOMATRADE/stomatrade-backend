import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Collector ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  collectorId: string;

  @ApiProperty({ description: 'Farmer ID', example: '770e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  @IsNotEmpty()
  farmerId: string;

  @ApiProperty({ description: 'Land ID', example: '880e8400-e29b-41d4-a716-446655440003' })
  @IsUUID()
  @IsNotEmpty()
  landId: string;

  @ApiProperty({
    description: 'Project name/title',
    example: 'Coffee Arabica Q1 Harvest',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Commodity type (e.g., Rice, Coffee, Corn)',
    example: 'Coffee',
  })
  @IsString()
  @IsNotEmpty()
  commodity: string;

  @ApiProperty({
    description: 'Volume in base units (e.g., kg)',
    example: 1000.5,
  })
  @IsNumber()
  @Min(0.000000000000000001)
  volume: number;

  @ApiProperty({
    description: 'Expected send/delivery date (ISO 8601)',
    example: '2025-02-15T08:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  sendDate: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'NFT Token ID (set after blockchain minting)',
    example: 3001,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiPropertyOptional({ description: 'Collector ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  collectorId?: string;

  @ApiPropertyOptional({ description: 'Farmer ID', example: '770e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({ description: 'Land ID', example: '880e8400-e29b-41d4-a716-446655440003' })
  @IsUUID()
  @IsOptional()
  landId?: string;

  @ApiPropertyOptional({
    description: 'Project name/title',
    example: 'Coffee Arabica Q1 Harvest',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Commodity type (e.g., Rice, Coffee, Corn)',
    example: 'Coffee',
  })
  @IsString()
  @IsOptional()
  commodity?: string;

  @ApiPropertyOptional({
    description: 'Volume in base units (e.g., kg)',
    example: 1000.5,
  })
  @IsNumber()
  @Min(0.000000000000000001)
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({
    description: 'Decimals used for volume representation',
    example: 18,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  volumeDecimal?: number;

  @ApiPropertyOptional({
    description: 'Profit share percentage (e.g., 20 for 20%)',
    example: 20,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  profitShare?: number;

  @ApiPropertyOptional({
    description: 'Expected send/delivery date (ISO 8601)',
    example: '2025-02-15T08:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  sendDate?: string;
}
