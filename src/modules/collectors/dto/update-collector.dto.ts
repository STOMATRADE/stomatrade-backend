import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCollectorDto {
  @ApiProperty({example: 'John Doe Updated',
    required: false,})
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({example: 'Jl. Baru No. 456, Jakarta',
    required: false,})
  @IsString()
  @IsOptional()
  address?: string;
}
