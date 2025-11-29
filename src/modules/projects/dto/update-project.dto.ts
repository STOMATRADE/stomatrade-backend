import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'NFT Token ID',
    example: 3001,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    description: 'Type of commodity',
    example: 'Premium Rice',
    required: false,
  })
  @IsString()
  @IsOptional()
  commodity?: string;

  @ApiProperty({
    description: 'Volume in units',
    example: 1050.0,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  volume?: number;

  @ApiProperty({
    description: 'Quality grade',
    example: 'A+',
    required: false,
  })
  @IsString()
  @IsOptional()
  gradeQuality?: string;

  @ApiProperty({
    description: 'Expected send/delivery date',
    example: '2025-02-20T08:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  sendDate?: string;
}
