import { ApiProperty } from '@nestjs/swagger';

export class ProfitPoolResponseDto {
    @ApiProperty({ example: 'cc0e8400-e29b-41d4-a716-446655440007' })
    id: string; // Project ID as PK

    @ApiProperty({ example: '1000000000000000000' })
    totalProfit: string;

    @ApiProperty({ example: '500000000000000000' })
    claimedProfit: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class UserProfitClaimResponseDto {
    @ApiProperty({ example: 'pp0e8400-e29b-41d4-a716-446655440010' })
    id: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    userId: string;

    @ApiProperty({ example: 'cc0e8400-e29b-41d4-a716-446655440007' })
    projectId: string;

    @ApiProperty({ example: '50000000000000000' })
    amount: string;

    @ApiProperty({ example: 'blockchain-tx-uuid', nullable: true })
    blockchainTxId: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
