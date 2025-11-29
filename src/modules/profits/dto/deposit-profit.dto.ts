import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DepositProfitDto {
  @ApiProperty({example: 'cc0e8400-e29b-41d4-a716-446655440007',})
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({example: '50000000000000000000',})
  @IsString()
  @IsNotEmpty()
  amount: string;
}
