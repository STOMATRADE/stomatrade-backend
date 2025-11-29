import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateInvestmentDto {
  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({example: 'cc0e8400-e29b-41d4-a716-446655440007',})
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({example: '100000000000000000000',})
  @IsString()
  @IsNotEmpty()
  amount: string;
}
