import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateLandDto {
  @ApiProperty({
    description: 'Associated farmer ID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId: string;

  @ApiProperty({
    description: 'NFT Token ID for the land',
    example: 2001,
  })
  @IsInt()
  @Min(1)
  tokenId: number;

  @ApiProperty({
    description: 'GPS Latitude coordinate',
    example: -6.2,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'GPS Longitude coordinate',
    example: 106.816666,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Land address/location description',
    example: 'Plot A1, Desa Makmur',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
