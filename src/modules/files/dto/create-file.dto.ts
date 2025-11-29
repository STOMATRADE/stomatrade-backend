import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'Reference ID - UUID of linked entity (farmer, project, etc.)',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  reffId: string;

  @ApiProperty({
    description: 'File URL (cloud storage URL)',
    example: 'https://storage.example.com/files/photo.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}
