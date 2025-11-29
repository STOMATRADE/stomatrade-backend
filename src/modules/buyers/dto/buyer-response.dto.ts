import { ApiProperty } from '@nestjs/swagger';

export class BuyerResponseDto {
  @ApiProperty({example: 'aa0e8400-e29b-41d4-a716-446655440005',})
  id: string;

  @ApiProperty({example: 'PT Agro Makmur',})
  companyName: string;

  @ApiProperty({example: 'Jl. Industri No. 789, Surabaya',})
  companyAddress: string;

  @ApiProperty({example: '081234567890',})
  phoneNumber: string;

  @ApiProperty({example: 'info@agromakmur.com',})
  companyMail: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: false,})
  deleted: boolean;
}

export class PaginatedBuyerResponseDto {
  @ApiProperty({type: [BuyerResponseDto],})
  items: BuyerResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
