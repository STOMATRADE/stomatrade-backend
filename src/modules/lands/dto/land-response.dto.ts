import { ApiProperty } from '@nestjs/swagger';

export class LandResponseDto {
  @ApiProperty({example: '880e8400-e29b-41d4-a716-446655440003',})
  id: string;

  @ApiProperty({example: '770e8400-e29b-41d4-a716-446655440002',})
  farmerId: string;

  @ApiProperty({example: 2001,})
  tokenId: number;

  @ApiProperty({example: -6.2,})
  latitude: number;

  @ApiProperty({example: 106.816666,})
  longitude: number;

  @ApiProperty({example: 'Plot A1, Desa Makmur',})
  address: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class LandWithRelationsDto extends LandResponseDto {
  @ApiProperty()
  farmer?: any;

  @ApiProperty({type: 'array',})
  projects?: any[];
}

export class PaginatedLandResponseDto {
  @ApiProperty({type: [LandResponseDto],})
  items: LandResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
