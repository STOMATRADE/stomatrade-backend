import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectProjectSubmissionDto {
  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',})
  @IsString()
  @IsNotEmpty()
  rejectedBy: string;

  @ApiProperty({example: 'Project value too low for crowdfunding',
    required: false,})
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
