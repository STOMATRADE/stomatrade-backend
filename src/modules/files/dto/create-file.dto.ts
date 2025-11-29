import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({example: '770e8400-e29b-41d4-a716-446655440002',})
  @IsUUID()
  @IsNotEmpty()
  reffId: string;

  @ApiProperty({example: 'https://storage.example.com/files/photo.jpg',})
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({example: 'image/jpeg',})
  @IsString()
  @IsNotEmpty()
  type: string;
}
