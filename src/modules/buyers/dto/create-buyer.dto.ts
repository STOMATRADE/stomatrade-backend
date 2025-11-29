import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBuyerDto {
  @ApiProperty({
    description: 'Company name',
    example: 'PT Agro Makmur',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Company address',
    example: 'Jl. Industri No. 789, Surabaya',
  })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '081234567890',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Company email (unique)',
    example: 'info@agromakmur.com',
  })
  @IsEmail()
  @IsNotEmpty()
  companyMail: string;
}
