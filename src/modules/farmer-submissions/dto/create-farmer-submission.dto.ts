import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFarmerSubmissionDto {
  @ApiProperty({
    description: 'Farmer ID to submit for NFT minting',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId: string;

  @ApiProperty({
    description: 'Primary commodity of the farmer',
    example: 'Coffee Arabica',
  })
  @IsString()
  @IsNotEmpty()
  commodity: string;

  @ApiProperty({
    description: 'Wallet address of submitter',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  submittedBy: string;
}
