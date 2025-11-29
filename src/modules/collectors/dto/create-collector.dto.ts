import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class CreateCollectorDto {
  @ApiProperty({
    description: 'Associated user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'NIK (Nomor Induk Kependudukan) - 16 digits',
    example: '3201234567890123',
    minLength: 16,
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(16, 16, { message: 'NIK must be exactly 16 characters' })
  nik: string;

  @ApiProperty({
    description: 'Collector full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Collector address',
    example: 'Jl. Raya No. 123, Jakarta',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
