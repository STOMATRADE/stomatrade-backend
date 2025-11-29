import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateBuyerDto {
  @ApiProperty({
    description: 'Company name',
    example: 'PT Agro Makmur Jaya',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Company address',
    example: 'Jl. Industri Baru No. 100, Surabaya',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyAddress?: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '081234567891',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Company email',
    example: 'contact@agromakmur.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  companyMail?: string;
}
