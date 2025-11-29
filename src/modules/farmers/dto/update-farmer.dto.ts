import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { GENDER } from '@prisma/client';

export class UpdateFarmerDto {
  @ApiProperty({
    description: 'NFT Token ID',
    example: 1001,
    required: false,
  })
  @IsInt()
  @IsOptional()
  tokenId?: number;

  @ApiProperty({
    description: 'Farmer full name',
    example: 'Farmer Jane Updated',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Farmer age (18-100)',
    example: 36,
    required: false,
  })
  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'Farmer gender',
    enum: GENDER,
    required: false,
  })
  @IsEnum(GENDER)
  @IsOptional()
  gender?: GENDER;

  @ApiProperty({
    description: 'Farmer address',
    example: 'Desa Sejahtera, Kec. Makmur',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
