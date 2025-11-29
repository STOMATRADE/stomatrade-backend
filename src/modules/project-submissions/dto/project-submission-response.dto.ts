import { ApiProperty } from '@nestjs/swagger';
import { SUBMISSION_STATUS } from '@prisma/client';

export class ProjectSubmissionResponseDto {
  @ApiProperty({example: 'a60e8400-e29b-41d4-a716-446655440007'})
  id: string;

  @ApiProperty({example: 'cc0e8400-e29b-41d4-a716-446655440007'})
  projectId: string;

  @ApiProperty({example: '1000000000000000000'})
  valueProject: string;

  @ApiProperty({example: '500000000000000000000'})
  maxCrowdFunding: string;

  @ApiProperty({example: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', nullable: true})
  metadataCid: string | null;

  @ApiProperty({enum: SUBMISSION_STATUS, example: SUBMISSION_STATUS.SUBMITTED})
  status: SUBMISSION_STATUS;

  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E'})
  submittedBy: string;

  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E', nullable: true})
  approvedBy: string | null;

  @ApiProperty({nullable: true})
  rejectionReason: string | null;

  @ApiProperty({example: 'blockchain-tx-uuid', nullable: true})
  blockchainTxId: string | null;

  @ApiProperty({example: 12, nullable: true})
  mintedTokenId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: '0x1234abcd...'})
  encodedCalldata: string;
}
