import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '990e8400-e29b-41d4-a716-446655440004',
  })
  id: string;

  @ApiProperty({
    description: 'Reference ID (linked entity UUID)',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  reffId: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/files/photo.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  type: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  deleted: boolean;
}

export class PaginatedFileResponseDto {
  @ApiProperty({
    description: 'List of files',
    type: [FileResponseDto],
  })
  data: FileResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
