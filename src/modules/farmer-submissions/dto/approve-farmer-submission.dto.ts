import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveFarmerSubmissionDto {
  @ApiProperty({
    description: 'Wallet address of approver (admin)',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}
