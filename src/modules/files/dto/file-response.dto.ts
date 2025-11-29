import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({example: '990e8400-e29b-41d4-a716-446655440004',})
  id: string;

  @ApiProperty({example: '770e8400-e29b-41d4-a716-446655440002',})
  reffId: string;

  @ApiProperty({example: 'https://storage.example.com/files/photo.jpg',})
  url: string;

  @ApiProperty({example: 'image/jpeg',})
  type: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class PaginatedFileResponseDto {
  @ApiProperty({type: [FileResponseDto],})
  items: FileResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
