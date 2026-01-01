import { ApiProperty } from '@nestjs/swagger';

export class UserRefundClaimResponseDto {
    @ApiProperty({ example: 'rr0e8400-e29b-41d4-a716-446655440011' })
    id: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    userId: string;

    @ApiProperty({ example: 'cc0e8400-e29b-41d4-a716-446655440007' })
    projectId: string;

    @ApiProperty({ example: '100000000000000000000' })
    amount: string;

    @ApiProperty({ example: 'blockchain-tx-uuid', nullable: true })
    blockchainTxId: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
