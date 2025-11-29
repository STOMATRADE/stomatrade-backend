import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLandDto {
  @ApiProperty({
    example: 2001,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    example: -6.201,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: 106.817,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    example: 'Plot A1-Updated, Desa Makmur',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
