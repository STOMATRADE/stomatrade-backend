import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ClaimProfitDto {
  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({example: 'cc0e8400-e29b-41d4-a716-446655440007',})
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
