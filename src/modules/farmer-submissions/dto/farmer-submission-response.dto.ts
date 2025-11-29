import { ApiProperty } from '@nestjs/swagger';
import { SUBMISSION_STATUS } from '@prisma/client';

export class FarmerSubmissionResponseDto {
  @ApiProperty({example: 'b10e8400-e29b-41d4-a716-446655440007'})
  id: string;

  @ApiProperty({example: '770e8400-e29b-41d4-a716-446655440002'})
  farmerId: string;

  @ApiProperty({example: 'Coffee Arabica'})
  commodity: string;

  @ApiProperty({enum: SUBMISSION_STATUS, example: SUBMISSION_STATUS.SUBMITTED})
  status: SUBMISSION_STATUS;

  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E'})
  submittedBy: string;

  @ApiProperty({nullable: true})
  approvedBy: string | null;

  @ApiProperty({nullable: true})
  rejectionReason: string | null;

  @ApiProperty({example: 'blockchain-tx-uuid', nullable: true})
  blockchainTxId: string | null;

  @ApiProperty({example: 9, nullable: true})
  mintedTokenId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({example: '0xa9059cbb...'})
  encodedCalldata: string;
}
