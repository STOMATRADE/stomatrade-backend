import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DepositProfitDto {
  @ApiProperty({
    description: 'Project ID to deposit profit for',
    example: 'cc0e8400-e29b-41d4-a716-446655440007',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Profit amount in IDRX (as string for bigint)',
    example: '50000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
