import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class MarkRefundableDto {
  @ApiProperty({
    description: 'Project ID to mark as refundable',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Reason for marking as refundable',
    example: 'Crowdfunding target not reached within deadline',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

