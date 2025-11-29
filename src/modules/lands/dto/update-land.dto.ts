import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLandDto {
  @ApiProperty({
    description: 'NFT Token ID',
    example: 2001,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    description: 'GPS Latitude coordinate',
    example: -6.201,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'GPS Longitude coordinate',
    example: 106.817,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Land address/location description',
    example: 'Plot A1-Updated, Desa Makmur',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
