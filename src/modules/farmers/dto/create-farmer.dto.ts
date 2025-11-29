import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  Max,
} from 'class-validator';
import { GENDER } from '@prisma/client';

export class CreateFarmerDto {
  @ApiProperty({
    description: 'Associated collector ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  collectorId: string;

  @ApiProperty({
    description: 'NFT Token ID (optional, set after minting)',
    example: 1001,
    required: false,
  })
  @IsInt()
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    description: 'NIK (Nomor Induk Kependudukan) - 16 digits',
    example: '3201234567890124',
  })
  @IsString()
  @IsNotEmpty()
  @Length(16, 16, { message: 'NIK must be exactly 16 characters' })
  nik: string;

  @ApiProperty({
    description: 'Farmer full name',
    example: 'Farmer Jane',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Farmer age (18-100)',
    example: 35,
    minimum: 18,
    maximum: 100,
  })
  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @ApiProperty({
    description: 'Farmer gender',
    enum: GENDER,
    example: 'FEMALE',
  })
  @IsEnum(GENDER)
  @IsNotEmpty()
  gender: GENDER;

  @ApiProperty({
    description: 'Farmer address',
    example: 'Desa Makmur, Kec. Subur',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
