# StomaTrade Blockchain Integration Guide

## Overview

This document provides a comprehensive guide to the blockchain integration that has been implemented for the StomaTrade platform. The integration connects the NestJS backend with the StomaTrade smart contract on the Lisk blockchain.

## Implementation Status

### ✅ Phase 1: Foundation (COMPLETED)

#### 1. Dependencies Installed
- `ethers@^6` - Blockchain interaction library
- `@nestjs/schedule` - Task scheduling for event listeners
- `@nestjs/config` - Environment configuration management

#### 2. Blockchain Module Structure Created
```
src/blockchain/
├── abi/
│   └── StomaTrade.json          # Smart contract ABI
├── services/
│   ├── ethers-provider.service.ts    # Blockchain RPC provider
│   ├── platform-wallet.service.ts    # Platform wallet management
│   ├── transaction.service.ts        # Transaction handling with retry logic
│   ├── stomatrade-contract.service.ts # Smart contract wrapper
│   └── blockchain-event.service.ts   # Event listening & parsing
├── interfaces/
│   └── blockchain-config.interface.ts # Type definitions
└── blockchain.module.ts
```

#### 3. Database Schema Extended
Added 7 new tables to support blockchain operations:

**FarmerSubmission**
- Tracks farmer NFT minting requests
- States: SUBMITTED → APPROVED → MINTED
- Links to blockchain transactions

**ProjectSubmission**
- Tracks project creation requests
- Approval workflow before blockchain minting
- Stores IPFS metadata CID

**Investment**
- Records investor contributions
- Links to NFT receipt tokens
- Tracks blockchain transaction hashes

**InvestmentPortfolio**
- Aggregated view of user investments
- Calculates ROI and totals
- Auto-updated by services

**NftMetadata**
- Syncs NFT metadata from blockchain
- Stores IPFS content locally
- Indexed by tokenId and owner

**BlockchainTransaction**
- Audit log of all blockchain transactions
- Tracks status (PENDING → CONFIRMED/FAILED)
- Stores gas costs and event data

**ProfitPool**
- Tracks profit deposits per project
- Calculates remaining claimable profit

**ProfitClaim**
- Records profit withdrawals by investors
- Links to investments and blockchain txs

#### 4. Farmer Submission Module (COMPLETED)
Complete implementation with approval workflow:

**Endpoints:**
- `POST /farmer-submissions` - Submit farmer for approval
- `GET /farmer-submissions?status=SUBMITTED` - List submissions
- `GET /farmer-submissions/:id` - Get submission details
- `PATCH /farmer-submissions/:id/approve` - Approve & mint NFT
- `PATCH /farmer-submissions/:id/reject` - Reject submission

**Flow:**
1. Collector submits farmer → Status: SUBMITTED
2. Admin approves → Calls smart contract `nftFarmer()` → Status: MINTED
3. NFT tokenId saved to farmer record
4. Blockchain transaction logged

## Environment Configuration

### Required Environment Variables

Update your `.env` file with these blockchain settings:

```bash
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc.sepolia-api.lisk.com
BLOCKCHAIN_CHAIN_ID=4202

# Smart Contract Addresses (UPDATE THESE!)
STOMATRADE_CONTRACT_ADDRESS=0x...your_deployed_contract_address
IDRX_TOKEN_CONTRACT_ADDRESS=0x...your_idrx_token_address

# Platform Wallet (NEVER commit this to git!)
PLATFORM_WALLET_PRIVATE_KEY=0x...your_private_key_here

# Transaction Settings
BLOCKCHAIN_CONFIRMATION_BLOCKS=1
BLOCKCHAIN_GAS_LIMIT_MULTIPLIER=1.2
BLOCKCHAIN_MAX_RETRIES=3
```

### Security Notes
- **NEVER** commit your private key to version control
- Use environment variables for all sensitive data
- Keep `.env` file in `.gitignore`
- Use separate wallets for dev/test/production

## Key Features Implemented

### 1. Blockchain Provider Service
- Connects to Lisk RPC endpoint
- Manages network connection
- Provides gas price estimation
- Handles transaction confirmation

### 2. Platform Wallet Service
- Signs transactions on behalf of the platform
- Manages platform wallet nonce
- Checks wallet balance
- Warns if balance is low

### 3. Transaction Service
- Sends transactions with retry logic (exponential backoff)
- EIP-1559 gas management
- Configurable confirmation blocks
- Auto gas limit estimation with multiplier
- Transaction receipt parsing

### 4. Smart Contract Service
Provides typed methods for all contract functions:

**Write Functions:**
- `createProject(valueProject, maxCrowdFunding, cid)`
- `mintFarmerNFT(namaKomoditas)`
- `invest(projectId, amount)`
- `depositProfit(projectId, amount)`
- `claimProfit(projectId)`
- `markRefundable(projectId)`
- `claimRefund(projectId)`
- `closeCrowdFunding(projectId)`

**Read Functions:**
- `getProject(projectId)` → Project data
- `getContribution(projectId, investor)` → Investment amount
- `getProfitPool(projectId)` → Total profit
- `getClaimedProfit(projectId, investor)` → Claimed amount
- `getTokenURI(tokenId)` → Metadata URI

### 5. Event Listening Service
Monitors blockchain events:
- `ProjectCreated`
- `FarmerMinted`
- `Invested`
- `ProfitDeposited`
- `ProfitClaimed`
- `Refunded`

Features:
- Real-time event listening
- Historical event sync from specific block
- Event parsing and database storage
- Auto-updates database on new events

## API Usage Examples

### 1. Submit Farmer for NFT Minting

```bash
POST /farmer-submissions
Content-Type: application/json

{
  "farmerId": "550e8400-e29b-41d4-a716-446655440001",
  "commodity": "Coffee Arabica",
  "submittedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

Response:
```json
{
  "id": "submission-uuid",
  "farmerId": "550e8400-e29b-41d4-a716-446655440001",
  "commodity": "Coffee Arabica",
  "status": "SUBMITTED",
  "submittedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2. Approve Farmer Submission (Mints NFT)

```bash
PATCH /farmer-submissions/{submission-id}/approve
Content-Type: application/json

{
  "approvedBy": "0xAdminWalletAddress"
}
```

This will:
1. Update submission status to APPROVED
2. Call smart contract to mint Farmer NFT
3. Wait for blockchain confirmation
4. Parse event to get tokenId
5. Update farmer record with tokenId
6. Update submission status to MINTED

Response:
```json
{
  "id": "submission-uuid",
  "farmerId": "550e8400-e29b-41d4-a716-446655440001",
  "commodity": "Coffee Arabica",
  "status": "MINTED",
  "submittedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "approvedBy": "0xAdminWalletAddress",
  "mintedTokenId": 1,
  "blockchainTxId": "blockchain-tx-uuid",
  "transaction": {
    "transactionHash": "0x123abc...",
    "status": "CONFIRMED",
    "blockNumber": 12345678
  }
}
```

## Testing the Integration

### Prerequisites
1. Deploy StomaTrade contract to Lisk Sepolia
2. Get platform wallet funded with test ETH
3. Update `.env` with contract addresses

### Manual Test Flow

1. **Create a User (Collector)**
```bash
POST /users
{
  "walletAddress": "0x...",
  "role": "COLLECTOR"
}
```

2. **Create a Collector Profile**
```bash
POST /collectors
{
  "userId": "{user-id}",
  "nik": "1234567890",
  "name": "John Collector",
  "address": "Jakarta"
}
```

3. **Create a Farmer**
```bash
POST /farmers
{
  "collectorId": "{collector-id}",
  "nik": "0987654321",
  "name": "Jane Farmer",
  "age": 35,
  "gender": "FEMALE",
  "address": "Bandung"
}
```

4. **Submit Farmer for NFT Minting**
```bash
POST /farmer-submissions
{
  "farmerId": "{farmer-id}",
  "commodity": "Coffee Arabica",
  "submittedBy": "0x...collector-wallet"
}
```

5. **Approve Submission (Admin)**
```bash
PATCH /farmer-submissions/{submission-id}/approve
{
  "approvedBy": "0x...admin-wallet"
}
```

6. **Verify on Blockchain**
- Check transaction on Lisk block explorer
- Verify NFT was minted
- Check farmer record has tokenId

## Next Steps (Pending Implementation)

### Phase 2: Project Submissions
Similar to farmer submissions but for projects:
- Project submission workflow
- IPFS metadata upload
- Project NFT minting
- Crowdfunding activation

### Phase 3: Investment Module
- Investor contribution tracking
- Receipt NFT minting
- Investment portfolio aggregation
- ROI calculation

### Phase 4: Profit Distribution
- Profit deposit by admin
- Proportional profit calculation
- Profit claim by investors
- Refund mechanism

### Phase 5: Event Sync & Monitoring
- Background job to sync events
- Portfolio recalculation cron
- NFT metadata sync
- Alert system for failures

## Troubleshooting

### Common Issues

**1. "Provider not initialized"**
- Check BLOCKCHAIN_RPC_URL is set correctly
- Verify network connectivity to RPC endpoint

**2. "Wallet not initialized"**
- Check PLATFORM_WALLET_PRIVATE_KEY is valid
- Ensure private key starts with '0x'

**3. "Transaction failed: insufficient funds"**
- Platform wallet needs ETH for gas
- Check balance with `GET /blockchain/wallet/balance`

**4. "Contract not initialized"**
- Verify STOMATRADE_CONTRACT_ADDRESS is correct
- Ensure contract is deployed on the network

**5. Database connection errors**
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync database

## Architecture Diagrams

### Farmer NFT Minting Flow
```
Collector → POST /farmer-submissions → Database (SUBMITTED)
                                           ↓
Admin → PATCH /farmer-submissions/:id/approve → Database (APPROVED)
                                                     ↓
Platform Wallet → stomaTradeContract.mintFarmerNFT() → Blockchain
                                                            ↓
Wait for confirmation (1 block) ← TransactionService
                                                            ↓
Parse FarmerMinted event → Extract tokenId
                                                            ↓
Update Farmer.tokenId & Submission (MINTED) → Database
```

### Service Dependencies
```
FarmerSubmissionsService
    ├── PrismaService (database)
    └── StomaTradeContractService
            ├── TransactionService
            │   ├── EthersProviderService
            │   └── PlatformWalletService
            └── EthersProviderService
```

## File Reference

### Core Blockchain Services
- [EthersProviderService](src/blockchain/services/ethers-provider.service.ts) - RPC provider management
- [PlatformWalletService](src/blockchain/services/platform-wallet.service.ts) - Wallet management
- [TransactionService](src/blockchain/services/transaction.service.ts) - Transaction handling
- [StomaTradeContractService](src/blockchain/services/stomatrade-contract.service.ts) - Contract wrapper
- [BlockchainEventService](src/blockchain/services/blockchain-event.service.ts) - Event listener

### Farmer Submissions
- [FarmerSubmissionsController](src/modules/farmer-submissions/farmer-submissions.controller.ts)
- [FarmerSubmissionsService](src/modules/farmer-submissions/farmer-submissions.service.ts)

### Database Schema
- [Prisma Schema](prisma/schema.prisma) - All models including blockchain tables

## Support

For issues or questions:
1. Check logs in dev server output
2. Review transaction on block explorer
3. Verify environment configuration
4. Check database records for status

---

**Status**: Phase 1 Complete (Foundation + Farmer Submissions)
**Next**: Implement Project Submissions Module
**Last Updated**: 2024-01-15
