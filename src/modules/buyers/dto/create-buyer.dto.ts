import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBuyerDto {
  @ApiProperty({example: 'PT Agro Makmur',})
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({example: 'Jl. Industri No. 789, Surabaya',})
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({example: '081234567890',})
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({example: 'info@agromakmur.com',})
  @IsEmail()
  @IsNotEmpty()
  companyMail: string;
}
