import { ApiProperty } from '@nestjs/swagger';
import { GENDER } from '@prisma/client';

export class FarmerResponseDto {
  @ApiProperty({example: '770e8400-e29b-41d4-a716-446655440002',})
  id: string;

  @ApiProperty({example: '660e8400-e29b-41d4-a716-446655440001',})
  collectorId: string;

  @ApiProperty({example: 1001,
    nullable: true,})
  tokenId: number | null;

  @ApiProperty({example: '3201234567890124',})
  nik: string;

  @ApiProperty({example: 'Farmer Jane',})
  name: string;

  @ApiProperty({example: 35,})
  age: number;

  @ApiProperty({enum: GENDER,
    example: 'FEMALE',})
  gender: GENDER;

  @ApiProperty({example: 'Desa Makmur, Kec. Subur',})
  address: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class FarmerWithRelationsDto extends FarmerResponseDto {
  @ApiProperty()
  collector?: any;

  @ApiProperty({type: 'array',})
  lands?: any[];

  @ApiProperty({type: 'array',})
  projects?: any[];

  @ApiProperty()
  farmerSubmission?: any;
}

export class PaginatedFarmerResponseDto {
  @ApiProperty({type: [FarmerResponseDto],})
  items: FarmerResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
