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
  @ApiProperty({example: 3001,
    required: false,})
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiProperty({example: 'Premium Rice',
    required: false,})
  @IsString()
  @IsOptional()
  commodity?: string;

  @ApiProperty({example: 1050.0,
    required: false,})
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  volume?: number;

  @ApiProperty({example: 'A+',
    required: false,})
  @IsString()
  @IsOptional()
  gradeQuality?: string;

  @ApiProperty({example: '2025-02-20T08:00:00.000Z',
    required: false,})
  @IsDateString()
  @IsOptional()
  sendDate?: string;
}
