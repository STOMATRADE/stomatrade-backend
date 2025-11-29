import { ApiProperty } from '@nestjs/swagger';
import { SUBMISSION_STATUS } from '@prisma/client';

export class FarmerSubmissionResponseDto {
  @ApiProperty({ description: 'Submission ID', example: 'b10e8400-e29b-41d4-a716-446655440007' })
  id: string;

  @ApiProperty({ description: 'Farmer ID', example: '770e8400-e29b-41d4-a716-446655440002' })
  farmerId: string;

  @ApiProperty({ description: 'Commodity', example: 'Coffee Arabica' })
  commodity: string;

  @ApiProperty({ description: 'Submission status', enum: SUBMISSION_STATUS, example: SUBMISSION_STATUS.SUBMITTED })
  status: SUBMISSION_STATUS;

  @ApiProperty({ description: 'Submitter wallet', example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E' })
  submittedBy: string;

  @ApiProperty({ description: 'Approver wallet', nullable: true })
  approvedBy: string | null;

  @ApiProperty({ description: 'Rejection reason', nullable: true })
  rejectionReason: string | null;

  @ApiProperty({ description: 'Blockchain transaction record ID', example: 'blockchain-tx-uuid', nullable: true })
  blockchainTxId: string | null;

  @ApiProperty({ description: 'Minted tokenId if minted', example: 9, nullable: true })
  mintedTokenId: number | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Prepared calldata for nftFarmer', example: '0xa9059cbb...' })
  encodedCalldata: string;
}
