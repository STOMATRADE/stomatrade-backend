import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { GENDER } from '@prisma/client';

export class UpdateFarmerDto {
  @ApiProperty({example: 1001,
    required: false,})
  @IsInt()
  @IsOptional()
  tokenId?: number;

  @ApiProperty({example: 'Farmer Jane Updated',
    required: false,})
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({example: 36,
    required: false,})
  @IsInt()
  @Min(18)
  @Max(100)
  @IsOptional()
  age?: number;

  @ApiProperty({enum: GENDER,
    required: false,})
  @IsEnum(GENDER)
  @IsOptional()
  gender?: GENDER;

  @ApiProperty({example: 'Desa Sejahtera, Kec. Makmur',
    required: false,})
  @IsString()
  @IsOptional()
  address?: string;
}
