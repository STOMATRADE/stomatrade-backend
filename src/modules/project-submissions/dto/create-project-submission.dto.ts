import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectSubmissionDto {
  @ApiProperty({
    description: 'Project ID to submit for blockchain minting',
    example: 'cc0e8400-e29b-41d4-a716-446655440007',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Project value in IDRX (as string for bigint)',
    example: '1000000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  valueProject: string;

  @ApiProperty({
    description: 'Maximum crowdfunding amount in IDRX',
    example: '500000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  maxCrowdFunding: string;

  @ApiProperty({
    description: 'IPFS CID for project metadata',
    example: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    required: false,
  })
  @IsString()
  @IsOptional()
  metadataCid?: string;

  @ApiProperty({
    description: 'Wallet address of submitter',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  submittedBy: string;
}
