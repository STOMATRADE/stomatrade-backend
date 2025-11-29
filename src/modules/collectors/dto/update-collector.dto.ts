import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCollectorDto {
  @ApiProperty({
    description: 'Collector full name',
    example: 'John Doe Updated',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Collector address',
    example: 'Jl. Baru No. 456, Jakarta',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
