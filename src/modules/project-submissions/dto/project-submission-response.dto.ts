import { ApiProperty } from '@nestjs/swagger';
import { SUBMISSION_STATUS } from '@prisma/client';

export class ProjectSubmissionResponseDto {
  @ApiProperty({ description: 'Submission ID', example: 'a60e8400-e29b-41d4-a716-446655440007' })
  id: string;

  @ApiProperty({ description: 'Project ID', example: 'cc0e8400-e29b-41d4-a716-446655440007' })
  projectId: string;

  @ApiProperty({ description: 'Project value (wei / smallest unit)', example: '1000000000000000000' })
  valueProject: string;

  @ApiProperty({ description: 'Max crowdfunding amount (wei / smallest unit)', example: '500000000000000000000' })
  maxCrowdFunding: string;

  @ApiProperty({ description: 'IPFS CID for metadata', example: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', nullable: true })
  metadataCid: string | null;

  @ApiProperty({ description: 'Submission status', enum: SUBMISSION_STATUS, example: SUBMISSION_STATUS.SUBMITTED })
  status: SUBMISSION_STATUS;

  @ApiProperty({ description: 'Submitter wallet', example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E' })
  submittedBy: string;

  @ApiProperty({ description: 'Approver wallet', example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E', nullable: true })
  approvedBy: string | null;

  @ApiProperty({ description: 'Rejection reason (if rejected)', nullable: true })
  rejectionReason: string | null;

  @ApiProperty({ description: 'Blockchain transaction record ID', example: 'blockchain-tx-uuid', nullable: true })
  blockchainTxId: string | null;

  @ApiProperty({ description: 'Minted tokenId if minted', example: 12, nullable: true })
  mintedTokenId: number | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Prepared calldata for createProject', example: '0x1234abcd...' })
  encodedCalldata: string;
}
