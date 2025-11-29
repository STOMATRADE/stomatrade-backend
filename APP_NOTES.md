# StoMaTrade Backend V2 - Application Notes

## 📋 Overview

**StoMaTrade** adalah platform backend untuk **Agricultural Supply Chain Management** yang mengintegrasikan blockchain (Lisk) untuk tokenisasi dan crowdfunding proyek pertanian. Platform ini menghubungkan petani, pengumpul (collector), investor, dan pembeli dalam ekosistem supply chain pertanian yang transparan dan terdesentralisasi.

### Tech Stack
- **Framework**: NestJS v11
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma v6.19
- **Blockchain**: Lisk (Sepolia Testnet) via Ethers.js v6
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI

---

## 🏗️ Project Structure

```
stomatrade-backend-v2/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # Root controller
│   ├── app.service.ts                   # Root service
│   │
│   ├── common/
│   │   └── dto/
│   │       └── pagination.dto.ts        # Shared pagination DTO
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts             # Prisma module (global)
│   │   └── prisma.service.ts            # Prisma client service
│   │
│   ├── blockchain/                      # Blockchain integration module
│   │   ├── blockchain.module.ts         # Module definition
│   │   ├── abi/
│   │   │   └── StomaTrade.json          # Smart contract ABI
│   │   ├── interfaces/
│   │   │   └── blockchain-config.interface.ts
│   │   └── services/
│   │       ├── ethers-provider.service.ts    # RPC provider management
│   │       ├── platform-wallet.service.ts    # Platform wallet management
│   │       ├── transaction.service.ts        # Transaction handling with retry
│   │       ├── stomatrade-contract.service.ts # Smart contract wrapper
│   │       └── blockchain-event.service.ts   # Event listening & parsing
│   │
│   └── modules/
│       ├── users/                       # User management
│       ├── collectors/                  # Collector management
│       ├── farmers/                     # Farmer management
│       ├── lands/                       # Land/plot management
│       ├── files/                       # File attachment management
│       ├── buyers/                      # Buyer/company management
│       ├── projects/                    # Agricultural project management
│       ├── notifications/               # Notification system
│       ├── farmer-submissions/          # Farmer NFT minting workflow
│       ├── project-submissions/         # Project NFT minting workflow
│       ├── investments/                 # Investment tracking
│       ├── portfolios/                  # Portfolio aggregation
│       └── profits/                     # Profit distribution
│
├── prisma/
│   └── schema.prisma                    # Database schema
│
├── dist/                                # Compiled output
├── test/                                # E2E tests
├── scripts/                             # Setup scripts
│
├── API_DOCUMENTATION.md                 # API reference
├── BLOCKCHAIN_INTEGRATION_GUIDE.md      # Blockchain guide
├── StorageStoma.sol                     # Solidity structs reference
└── package.json
```

---

## 📦 Module Feature Mapping

### 1. **Users Module** (`/users`)
Manajemen akun pengguna berbasis wallet address.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create User | `/users` | POST | Membuat user baru dengan wallet address |
| Get All Users | `/users` | GET | List semua user dengan pagination |
| Get User by ID | `/users/:id` | GET | Detail user berdasarkan ID |
| Update User | `/users/:id` | PATCH | Update data user (role) |
| Delete User | `/users/:id` | DELETE | Soft delete user |

**Roles**: `ADMIN`, `STAFF`, `INVESTOR`, `COLLECTOR`

**Data Model**:
```prisma
model User {
  id             String    @id @default(uuid())
  walletAddress  String    @unique
  role           ROLES
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deleted        Boolean   @default(false)
}
```

---

### 2. **Collectors Module** (`/collectors`)
Manajemen pengumpul hasil pertanian yang terhubung dengan user.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Collector | `/collectors` | POST | Daftarkan collector baru |
| Get All Collectors | `/collectors` | GET | List semua collector |
| Get Collector by ID | `/collectors/:id` | GET | Detail collector |
| Update Collector | `/collectors/:id` | PATCH | Update data collector |
| Delete Collector | `/collectors/:id` | DELETE | Soft delete collector |

**Data Model**:
```prisma
model Collector {
  id        String   @id @default(uuid())
  userId    String   @unique
  nik       String   @unique      # Nomor Induk Kependudukan
  name      String
  address   String
  user      User     @relation
  farmers   Farmer[]              # One-to-many dengan Farmer
}
```

---

### 3. **Farmers Module** (`/farmers`)
Manajemen petani yang dikelola oleh collector.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Farmer | `/farmers` | POST | Daftarkan petani baru |
| Get All Farmers | `/farmers` | GET | List semua petani |
| Get Farmers by Collector | `/farmers/collector/:collectorId` | GET | List petani per collector |
| Get Farmer by ID | `/farmers/:id` | GET | Detail petani |
| Update Farmer | `/farmers/:id` | PATCH | Update data petani |
| Delete Farmer | `/farmers/:id` | DELETE | Soft delete petani |

**Data Model**:
```prisma
model Farmer {
  id          String   @id @default(uuid())
  collectorId String
  tokenId     Int?                 # NFT Token ID (after minting)
  nik         String   @unique
  name        String
  age         Int
  gender      GENDER               # MALE / FEMALE
  address     String
  collector   Collector @relation
  lands       Land[]
  projects    Project[]
  farmerSubmission FarmerSubmission?
}
```

---

### 4. **Lands Module** (`/lands`)
Manajemen lahan pertanian milik petani dengan koordinat GPS.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Land | `/lands` | POST | Daftarkan lahan baru |
| Get All Lands | `/lands` | GET | List semua lahan |
| Get Lands by Farmer | `/lands/farmer/:farmerId` | GET | List lahan per petani |
| Get Land by ID | `/lands/:id` | GET | Detail lahan |
| Update Land | `/lands/:id` | PATCH | Update data lahan |
| Delete Land | `/lands/:id` | DELETE | Soft delete lahan |

**Data Model**:
```prisma
model Land {
  id        String   @id @default(uuid())
  farmerId  String
  tokenId   Int                    # NFT Token ID
  latitude  Float
  longitude Float
  address   String
  farmer    Farmer   @relation
  projects  Project[]
}
```

---

### 5. **Files Module** (`/files`)
Manajemen file attachment untuk berbagai entitas.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create File | `/files` | POST | Upload referensi file |
| Get All Files | `/files` | GET | List semua file |
| Get Files by Reference | `/files/reference/:reffId` | GET | List file berdasarkan entity |
| Get File by ID | `/files/:id` | GET | Detail file |
| Delete File | `/files/:id` | DELETE | Soft delete file |

**Data Model**:
```prisma
model File {
  id        String   @id @default(uuid())
  reffId    String                 # Reference to any entity
  url       String
  type      String                 # MIME type
}
```

---

### 6. **Buyers Module** (`/buyers`)
Manajemen pembeli/perusahaan dan riwayat transaksi.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Buyer | `/buyers` | POST | Daftarkan pembeli baru |
| Get All Buyers | `/buyers` | GET | List semua pembeli |
| Get Buyer by ID | `/buyers/:id` | GET | Detail pembeli |
| Update Buyer | `/buyers/:id` | PATCH | Update data pembeli |
| Delete Buyer | `/buyers/:id` | DELETE | Soft delete pembeli |
| Create Buyer History | `/buyers/history` | POST | Tambah riwayat transaksi |
| Get History by Buyer | `/buyers/:buyerId/history` | GET | List riwayat per buyer |
| Update History | `/buyers/history/:id` | PATCH | Update riwayat |
| Delete History | `/buyers/history/:id` | DELETE | Soft delete riwayat |

**Data Model**:
```prisma
model Buyer {
  id             String   @id @default(uuid())
  companyName    String
  companyAddress String
  phoneNumber    String
  companyMail    String   @unique
  history        BuyerHistory[]
}

model BuyerHistory {
  id                      String   @id @default(uuid())
  buyerId                 String
  buyerTransactionSuccess Int      @default(0)
  buyerTransactionFail    Int      @default(0)
  buyerTier               String   # e.g., GOLD, PLATINUM
}
```

---

### 7. **Projects Module** (`/projects`)
Manajemen proyek pertanian (komoditas).

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Project | `/projects` | POST | Buat proyek baru |
| Get All Projects | `/projects` | GET | List semua proyek |
| Get Projects by Farmer | `/projects/farmer/:farmerId` | GET | List proyek per petani |
| Get Projects by Land | `/projects/land/:landId` | GET | List proyek per lahan |
| Get Project by ID | `/projects/:id` | GET | Detail proyek |
| Update Project | `/projects/:id` | PATCH | Update data proyek |
| Delete Project | `/projects/:id` | DELETE | Soft delete proyek |

**Data Model**:
```prisma
model Project {
  id           String   @id @default(uuid())
  tokenId      Int?                 # NFT Token ID (after minting)
  commodity    String               # Jenis komoditas (Rice, Coffee, etc.)
  volume       Float                # Volume dalam satuan tertentu
  gradeQuality String               # Grade kualitas (A, B, C, A+)
  farmerId     String
  landId       String
  sendDate     DateTime             # Tanggal pengiriman
  farmer       Farmer   @relation
  land         Land     @relation
  projectSubmission ProjectSubmission?
  investments  Investment[]
  profitPool   ProfitPool?
}
```

---

### 8. **Notifications Module** (`/notifications`)
Sistem notifikasi dengan channel dan token FCM.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Channel | `/notifications/channels` | POST | Buat channel notifikasi |
| Get All Channels | `/notifications/channels` | GET | List semua channel |
| Get Channel by ID | `/notifications/channels/:id` | GET | Detail channel |
| Delete Channel | `/notifications/channels/:id` | DELETE | Soft delete channel |
| Create Notification | `/notifications` | POST | Buat notifikasi |
| Get All Notifications | `/notifications` | GET | List semua notifikasi |
| Get Notification by ID | `/notifications/:id` | GET | Detail notifikasi |
| Delete Notification | `/notifications/:id` | DELETE | Soft delete notifikasi |
| Create Token | `/notifications/tokens` | POST | Register FCM token |
| Get Tokens by User | `/notifications/tokens/user/:userId` | GET | List token per user |
| Delete Token | `/notifications/tokens/:id` | DELETE | Soft delete token |

**Data Models**:
```prisma
model ChannelNotification {
  id          String         @id @default(uuid())
  key         String         @unique
  desc        String
  notification Notification?
}

model Notification {
  id          String              @id @default(uuid())
  channelId   String              @unique
  title       String
  body        String
  channel     ChannelNotification @relation
}

model TokenNotification {
  id        String   @id @default(uuid())
  userId    String
  tokenId   String               # FCM token
  user      User     @relation
}
```

---

### 9. **Farmer Submissions Module** (`/farmer-submissions`) 🔗 Blockchain
Workflow persetujuan dan minting NFT untuk petani.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Submission | `/farmer-submissions` | POST | Submit petani untuk approval |
| Get All Submissions | `/farmer-submissions` | GET | List submissions (filter by status) |
| Get Submission by ID | `/farmer-submissions/:id` | GET | Detail submission |
| Approve Submission | `/farmer-submissions/:id/approve` | PATCH | Approve & mint NFT |
| Reject Submission | `/farmer-submissions/:id/reject` | PATCH | Reject submission |

**Flow**:
```
Collector Submit → Status: SUBMITTED
         ↓
Admin Approve → Status: APPROVED → Call mintFarmerNFT() → Blockchain
         ↓
Parse FarmerMinted event → Get tokenId → Update Farmer.tokenId
         ↓
Status: MINTED
```

**Data Model**:
```prisma
model FarmerSubmission {
  id              String            @id @default(uuid())
  farmerId        String            @unique
  commodity       String
  status          SUBMISSION_STATUS @default(SUBMITTED)
  submittedBy     String            # Wallet address
  approvedBy      String?           # Wallet address
  rejectionReason String?
  blockchainTxId  String?
  mintedTokenId   Int?
  farmer          Farmer            @relation
  transaction     BlockchainTransaction? @relation
}
```

---

### 10. **Project Submissions Module** (`/project-submissions`) 🔗 Blockchain
Workflow persetujuan dan minting NFT untuk proyek.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Submission | `/project-submissions` | POST | Submit proyek untuk approval |
| Get All Submissions | `/project-submissions` | GET | List submissions (filter by status) |
| Get Submission by ID | `/project-submissions/:id` | GET | Detail submission |
| Approve Submission | `/project-submissions/:id/approve` | PATCH | Approve & create project on chain |
| Reject Submission | `/project-submissions/:id/reject` | PATCH | Reject submission |

**Flow**:
```
Submit Project → Status: SUBMITTED
         ↓
Admin Approve → Status: APPROVED → Call createProject() → Blockchain
         ↓
Parse ProjectCreated event → Get tokenId → Update Project.tokenId
         ↓
Status: MINTED (Crowdfunding Active)
```

**Data Model**:
```prisma
model ProjectSubmission {
  id               String            @id @default(uuid())
  projectId        String            @unique
  valueProject     String            # Value in IDRX (string for bigint)
  maxCrowdFunding  String            # Max funding amount
  metadataCid      String?           # IPFS CID for metadata
  status           SUBMISSION_STATUS @default(SUBMITTED)
  submittedBy      String
  approvedBy       String?
  rejectionReason  String?
  blockchainTxId   String?
  mintedTokenId    Int?
  project          Project           @relation
  transaction      BlockchainTransaction? @relation
}
```

---

### 11. **Investments Module** (`/investments`) 🔗 Blockchain
Tracking investasi dari investor ke proyek.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Create Investment | `/investments` | POST | Invest ke proyek |
| Get All Investments | `/investments` | GET | List investasi (filter by user/project) |
| Get Investment by ID | `/investments/:id` | GET | Detail investasi |
| Get Project Stats | `/investments/project/:projectId/stats` | GET | Statistik investasi proyek |

**Flow**:
```
Investor Invest → Create Investment record → Call invest() → Blockchain
         ↓
Parse Invested event → Get receiptTokenId → Update Investment
         ↓
Auto-update User Portfolio
```

**Data Model**:
```prisma
model Investment {
  id                String   @id @default(uuid())
  userId            String
  projectId         String
  amount            String               # Amount in IDRX
  receiptTokenId    Int?                 # Receipt NFT Token ID
  transactionHash   String?
  blockNumber       Int?
  investedAt        DateTime @default(now())
  user              User     @relation
  project           Project  @relation
  profitClaims      ProfitClaim[]
}
```

---

### 12. **Portfolios Module** (`/portfolios`)
Agregasi portfolio investasi user.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Get User Portfolio | `/portfolios/user/:userId` | GET | Portfolio detail user |
| Get All Portfolios | `/portfolios` | GET | List semua portfolio (admin) |
| Get Top Investors | `/portfolios/top?limit=10` | GET | Top investors |
| Get Global Stats | `/portfolios/stats` | GET | Statistik global |

**Data Model**:
```prisma
model InvestmentPortfolio {
  id                    String   @id @default(uuid())
  userId                String   @unique
  totalInvested         String               # Total IDRX invested
  totalProfit           String               # Total profit earned
  totalClaimed          String               # Total profit claimed
  activeInvestments     Int      @default(0)
  completedInvestments  Int      @default(0)
  avgROI                Float    @default(0) # Average ROI percentage
  lastCalculatedAt      DateTime @default(now())
  user                  User     @relation
}
```

---

### 13. **Profits Module** (`/profits`) 🔗 Blockchain
Distribusi dan klaim profit dari proyek.

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Deposit Profit | `/profits/deposit` | POST | Admin deposit profit ke proyek |
| Claim Profit | `/profits/claim` | POST | Investor klaim profit |
| Get Project Profit Pool | `/profits/project/:projectId` | GET | Detail profit pool proyek |
| Get User Profit Claims | `/profits/user/:userId/claims` | GET | History klaim user |
| Get All Profit Pools | `/profits/pools` | GET | List semua profit pool |

**Flow**:
```
Admin Deposit Profit → Call depositProfit() → Blockchain
         ↓
Update ProfitPool record (totalDeposited, remainingProfit)

Investor Claim Profit → Call claimProfit() → Blockchain
         ↓
Parse ProfitClaimed event → Get amount → Create ProfitClaim record
         ↓
Update ProfitPool (totalClaimed, remainingProfit)
```

**Data Models**:
```prisma
model ProfitPool {
  id                String   @id @default(uuid())
  projectId         String   @unique
  totalDeposited    String
  totalClaimed      String
  remainingProfit   String
  lastDepositAt     DateTime?
  project           Project  @relation
  profitClaims      ProfitClaim[]
}

model ProfitClaim {
  id                String   @id @default(uuid())
  userId            String
  profitPoolId      String
  investmentId      String
  amount            String
  transactionHash   String?
  blockNumber       Int?
  claimedAt         DateTime @default(now())
  user              User        @relation
  profitPool        ProfitPool  @relation
  investment        Investment  @relation
}
```

---

## ⛓️ Blockchain Integration Module

### Services Overview

#### 1. **EthersProviderService**
Manajemen koneksi ke blockchain RPC.

```typescript
class EthersProviderService {
  getProvider(): JsonRpcProvider      // Get RPC provider
  getChainId(): number                // Get chain ID
  getBlockNumber(): Promise<number>   // Current block
  getGasPrice(): Promise<bigint>      // Current gas price
  estimateGas(tx): Promise<bigint>    // Estimate gas
  waitForTransaction(hash): Promise<Receipt>
  getBalance(address): Promise<bigint>
  parseUnits(value, decimals): bigint
  formatUnits(value, decimals): string
}
```

#### 2. **PlatformWalletService**
Manajemen wallet platform untuk signing transactions.

```typescript
class PlatformWalletService {
  getWallet(): Wallet                 // Get wallet instance
  getAddress(): string                // Platform wallet address
  getBalance(): Promise<bigint>       // Wallet balance
  getNonce(): Promise<number>         // Current nonce
  signMessage(message): Promise<string>
  signTransaction(tx): Promise<string>
  sendTransaction(tx): Promise<TransactionResponse>
}
```

#### 3. **TransactionService**
Handling transaksi dengan retry logic.

```typescript
class TransactionService {
  sendTransaction(tx, options): Promise<TransactionResult>
  executeContractMethod(contract, method, args): Promise<TransactionResult>
  callContractMethod(contract, method, args): Promise<any>
}

interface TransactionResult {
  hash: string
  receipt: TransactionReceipt | null
  success: boolean
  blockNumber?: number
  gasUsed?: bigint
  effectiveGasPrice?: bigint
}
```

Features:
- Retry logic dengan exponential backoff
- EIP-1559 gas management
- Configurable confirmation blocks
- Auto gas limit estimation

#### 4. **StomaTradeContractService**
Wrapper untuk smart contract StomaTrade.

**Write Functions**:
```typescript
createProject(valueProject, maxCrowdFunding, cid): Promise<TransactionResult>
mintFarmerNFT(namaKomoditas): Promise<TransactionResult>
invest(projectId, amount): Promise<TransactionResult>
depositProfit(projectId, amount): Promise<TransactionResult>
claimProfit(projectId): Promise<TransactionResult>
markRefundable(projectId): Promise<TransactionResult>
claimRefund(projectId): Promise<TransactionResult>
closeCrowdFunding(projectId): Promise<TransactionResult>
```

**Read Functions**:
```typescript
getProject(projectId): Promise<ProjectData>
getContribution(projectId, investor): Promise<bigint>
getProfitPool(projectId): Promise<bigint>
getClaimedProfit(projectId, investor): Promise<bigint>
getTokenURI(tokenId): Promise<string>
```

#### 5. **BlockchainEventService**
Listening dan parsing blockchain events.

**Events Monitored**:
- `ProjectCreated` - Project baru dibuat
- `FarmerMinted` - Farmer NFT di-mint
- `Invested` - Investasi baru
- `ProfitDeposited` - Profit disetorkan
- `ProfitClaimed` - Profit diklaim
- `Refunded` - Refund dilakukan

```typescript
startListening()                      // Start real-time listening
stopListening()                       // Stop listening
queryPastEvents(eventName, fromBlock, toBlock): Promise<BlockchainEvent[]>
syncEventsFromBlock(fromBlock): Promise<void>
```

---

## 🗄️ Database Schema Enums

```prisma
enum ROLES {
  ADMIN
  STAFF
  INVESTOR
  COLLECTOR
}

enum GENDER {
  MALE
  FEMALE
}

enum SUBMISSION_STATUS {
  SUBMITTED
  APPROVED
  REJECTED
  MINTED
}

enum PROJECT_STATUS {
  ACTIVE
  SUCCESS
  REFUNDING
  CLOSED
}

enum TRANSACTION_STATUS {
  PENDING
  CONFIRMED
  FAILED
}

enum TRANSACTION_TYPE {
  CREATE_PROJECT
  MINT_FARMER_NFT
  INVEST
  DEPOSIT_PROFIT
  CLAIM_PROFIT
  REFUND
  CLOSE_CROWDFUNDING
}
```

---

## ⚙️ Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Application
PORT=3000
NODE_ENV=development

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc.sepolia-api.lisk.com
BLOCKCHAIN_CHAIN_ID=4202
BLOCKCHAIN_CONFIRMATION_BLOCKS=1
BLOCKCHAIN_GAS_LIMIT_MULTIPLIER=1.2
BLOCKCHAIN_MAX_RETRIES=3

# Smart Contract Addresses
STOMA_TRADE_ADDRESS=0x...
IDRX_TOKEN_CONTRACT_ADDRESS=0x...

# Platform Wallet (NEVER commit!)
PLATFORM_WALLET_PRIVATE_KEY=0x...
```

---

## 🔄 Application Flow

### Complete Business Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING PHASE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User Registration (wallet-based)                                │
│     └── POST /users { walletAddress, role }                         │
│                                                                     │
│  2. Collector Profile                                               │
│     └── POST /collectors { userId, nik, name, address }             │
│                                                                     │
│  3. Farmer Registration (by Collector)                              │
│     └── POST /farmers { collectorId, nik, name, age, gender }       │
│                                                                     │
│  4. Land Registration                                               │
│     └── POST /lands { farmerId, tokenId, latitude, longitude }      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NFT MINTING PHASE (Blockchain)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  5. Submit Farmer for NFT                                           │
│     └── POST /farmer-submissions { farmerId, commodity, submittedBy }│
│                                                                     │
│  6. Admin Approves → Mint Farmer NFT                                │
│     └── PATCH /farmer-submissions/:id/approve { approvedBy }        │
│     └── Blockchain: mintFarmerNFT() → FarmerMinted event            │
│     └── Farmer.tokenId updated                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PROJECT CREATION PHASE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  7. Create Project (off-chain)                                      │
│     └── POST /projects { commodity, volume, gradeQuality, ...}      │
│                                                                     │
│  8. Submit Project for Crowdfunding                                 │
│     └── POST /project-submissions { projectId, valueProject, ... }  │
│                                                                     │
│  9. Admin Approves → Create Project on Blockchain                   │
│     └── PATCH /project-submissions/:id/approve { approvedBy }       │
│     └── Blockchain: createProject() → ProjectCreated event          │
│     └── Project.tokenId updated, Crowdfunding Active                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       INVESTMENT PHASE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  10. Investor Makes Investment                                      │
│      └── POST /investments { userId, projectId, amount }            │
│      └── Blockchain: invest() → Invested event                      │
│      └── Investment.receiptTokenId (Receipt NFT)                    │
│      └── Portfolio auto-updated                                     │
│                                                                     │
│  11. Check Portfolio                                                │
│      └── GET /portfolios/user/:userId                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PROFIT DISTRIBUTION PHASE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  12. Admin Deposits Profit (after project success)                  │
│      └── POST /profits/deposit { projectId, amount }                │
│      └── Blockchain: depositProfit() → ProfitDeposited event        │
│                                                                     │
│  13. Investor Claims Profit                                         │
│      └── POST /profits/claim { userId, projectId }                  │
│      └── Blockchain: claimProfit() → ProfitClaimed event            │
│      └── Proportional profit based on investment share              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Features

### Global Features
- ✅ **Pagination** - All list endpoints support `?page=1&limit=10`
- ✅ **Soft Delete** - Data tidak benar-benar dihapus (deleted: true)
- ✅ **Validation** - Global ValidationPipe dengan whitelist
- ✅ **CORS** - Enabled untuk cross-origin requests
- ✅ **Swagger** - Interactive API docs at `/api`

### Error Handling
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

---

## 🚀 Running the Application

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

**Access Points**:
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- Prisma Studio: `npx prisma studio`

---

## 📝 Implementation Status

### ✅ Completed
- [x] Core CRUD modules (Users, Collectors, Farmers, Lands, Files, Buyers, Projects, Notifications)
- [x] Blockchain module setup (Provider, Wallet, Transaction services)
- [x] Farmer Submissions with NFT minting
- [x] Project Submissions with NFT minting
- [x] Investments module with receipt NFT
- [x] Portfolios module
- [x] Profits module (deposit & claim)
- [x] Event listening service

### 🔄 Pending/TODO
- [ ] Authentication/Authorization (JWT/Wallet-based)
- [ ] IPFS integration for metadata storage
- [ ] Complete event handlers to update database
- [ ] Cron jobs for portfolio recalculation
- [ ] NFT metadata sync service
- [ ] Refund mechanism implementation
- [ ] Rate limiting
- [ ] Logging to external service

---

## 🔐 Security Notes

1. **Private Key**: NEVER commit `PLATFORM_WALLET_PRIVATE_KEY` to git
2. **Environment**: Use separate wallets for dev/test/production
3. **Validation**: All inputs validated via class-validator
4. **Soft Delete**: Data preservation for audit trail

---

## 📚 Related Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [BLOCKCHAIN_INTEGRATION_GUIDE.md](./BLOCKCHAIN_INTEGRATION_GUIDE.md) - Blockchain integration details
- [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) - Swagger usage guide

---

## 📜 CHANGELOG - Development History

### Version 1.1.0 - Blockchain Integration Complete (November 2025)

#### 🆕 New Modules Added

**1. Project Submissions Module** (`src/modules/project-submissions/`)
| File | Description |
|------|-------------|
| `dto/create-project-submission.dto.ts` | DTO untuk submit project dengan `projectId`, `valueProject`, `maxCrowdFunding`, `metadataCid`, `submittedBy` |
| `dto/approve-project-submission.dto.ts` | DTO untuk approval dengan `approvedBy` (wallet address) |
| `dto/reject-project-submission.dto.ts` | DTO untuk rejection dengan `rejectedBy`, `rejectionReason` |
| `project-submissions.service.ts` | Service dengan blockchain integration untuk project NFT minting via `createProject()` |
| `project-submissions.controller.ts` | REST Controller dengan 5 endpoints |
| `project-submissions.module.ts` | Module configuration |

**Endpoints Implemented:**
```
POST   /project-submissions           - Submit project for NFT minting approval
GET    /project-submissions           - Get all submissions (filter by ?status=)
GET    /project-submissions/:id       - Get submission by ID
PATCH  /project-submissions/:id/approve - Approve & mint Project NFT on blockchain
PATCH  /project-submissions/:id/reject  - Reject submission
```

**Key Features:**
- Approval workflow: SUBMITTED → APPROVED → MINTED
- Calls `stomaTradeContract.createProject(valueProject, maxCrowdFunding, cid)`
- Parses `ProjectCreated` event to extract `tokenId`
- Updates `Project.tokenId` after successful minting
- Creates `BlockchainTransaction` record for audit

---

**2. Investments Module** (`src/modules/investments/`)
| File | Description |
|------|-------------|
| `dto/create-investment.dto.ts` | DTO dengan `userId`, `projectId`, `amount` |
| `investments.service.ts` | Service dengan blockchain integration untuk investasi |
| `investments.controller.ts` | REST Controller dengan 5 endpoints |
| `investments.module.ts` | Module configuration |

**Endpoints Implemented:**
```
POST   /investments                        - Create investment & mint Receipt NFT
GET    /investments                        - Get all investments (?userId=&projectId=)
GET    /investments/:id                    - Get investment by ID
GET    /investments/project/:projectId/stats - Get project investment statistics
GET    /investments/portfolio/recalculate  - Manually trigger portfolio recalculation
```

**Key Features:**
- Verifies project has been minted (`Project.tokenId` exists)
- Calls `stomaTradeContract.invest(projectTokenId, amount)`
- Parses `Invested` event to get `receiptTokenId`
- **Auto-updates user portfolio** after each investment
- Calculates project statistics (totalInvested, uniqueInvestors)
- `recalculateAllPortfolios()` for batch portfolio updates

---

**3. Portfolios Module** (`src/modules/portfolios/`)
| File | Description |
|------|-------------|
| `portfolios.service.ts` | Read-only service for portfolio viewing and statistics |
| `portfolios.controller.ts` | REST Controller dengan 4 endpoints |
| `portfolios.module.ts` | Simple module (no blockchain integration) |

**Endpoints Implemented:**
```
GET    /portfolios/stats         - Global portfolio statistics
GET    /portfolios/top-investors - Top investors by total invested (?limit=10)
GET    /portfolios/all           - All portfolios (admin only)
GET    /portfolios/user/:userId  - User portfolio with investment details
```

**Key Features:**
- Portfolio data aggregation from `InvestmentPortfolio` table
- Includes investment details with project info
- Calculates profit claimed per investment
- Global stats: totalInvestors, totalInvested, totalProfit, avgROI

---

**4. Profits Module** (`src/modules/profits/`)
| File | Description |
|------|-------------|
| `dto/deposit-profit.dto.ts` | DTO dengan `projectId`, `amount` |
| `dto/claim-profit.dto.ts` | DTO dengan `userId`, `projectId` |
| `profits.service.ts` | Service dengan blockchain integration untuk profit management |
| `profits.controller.ts` | REST Controller dengan 5 endpoints |
| `profits.module.ts` | Module configuration |

**Endpoints Implemented:**
```
POST   /profits/deposit              - Admin deposits profit to blockchain
POST   /profits/claim                - Investor claims profit from blockchain
GET    /profits/pools                - Get all profit pools
GET    /profits/project/:projectId   - Get project profit pool details
GET    /profits/user/:userId         - Get user's profit claims history
```

**Key Features:**
- **Deposit Profit**: Calls `stomaTradeContract.depositProfit(projectTokenId, amount)`
- **Claim Profit**: Calls `stomaTradeContract.claimProfit(projectTokenId)`
- Parses `ProfitClaimed` event to get claimed amount
- Creates/updates `ProfitPool` records
- Creates `ProfitClaim` records for audit trail
- Updates `totalDeposited`, `totalClaimed`, `remainingProfit`

---

#### 📝 Files Modified

**`src/app.module.ts`**
```typescript
// Added imports:
import { ProjectSubmissionsModule } from './modules/project-submissions/project-submissions.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { ProfitsModule } from './modules/profits/profits.module';

// Added to imports array:
@Module({
  imports: [
    // ... existing modules
    ProjectSubmissionsModule,
    InvestmentsModule,
    PortfoliosModule,
    ProfitsModule,
  ],
})
```

---

#### 📊 Summary of Changes

| Category | Count | Details |
|----------|-------|---------|
| New Modules | 4 | project-submissions, investments, portfolios, profits |
| New Files | 16 | DTOs, Services, Controllers, Modules |
| New Endpoints | 19 | See endpoint lists above |
| Blockchain Integrations | 3 | invest(), depositProfit(), claimProfit() |
| Database Tables Used | 5 | Investment, InvestmentPortfolio, ProfitPool, ProfitClaim, BlockchainTransaction |

---

#### ✅ Completion Status After This Session

| Module | Status | Blockchain |
|--------|--------|------------|
| Users | ✅ Complete | ❌ |
| Collectors | ✅ Complete | ❌ |
| Farmers | ✅ Complete | ❌ |
| Lands | ✅ Complete | ❌ |
| Files | ✅ Complete | ❌ |
| Buyers | ✅ Complete | ❌ |
| Projects | ✅ Complete | ❌ |
| Notifications | ✅ Complete | ❌ |
| Farmer Submissions | ✅ Complete | ✅ mintFarmerNFT() |
| **Project Submissions** | ✅ **NEW** | ✅ createProject() |
| **Investments** | ✅ **NEW** | ✅ invest() |
| **Portfolios** | ✅ **NEW** | ❌ (read-only) |
| **Profits** | ✅ **NEW** | ✅ depositProfit(), claimProfit() |

---

### Version 1.2.0 - Authentication, Cron Jobs & Refunds (November 2025)

#### 🆕 New Modules Added

**1. Authentication Module** (`src/modules/auth/`)
Complete wallet-based authentication system with JWT.

| File | Description |
|------|-------------|
| `auth.module.ts` | Module dengan JWT & Passport configuration |
| `auth.service.ts` | Service untuk nonce generation, signature verification, JWT |
| `auth.controller.ts` | Controller dengan 5 endpoints |
| `dto/request-nonce.dto.ts` | DTO untuk request nonce |
| `dto/verify-signature.dto.ts` | DTO untuk verify signature |
| `dto/register-user.dto.ts` | DTO untuk register user (admin) |
| `strategies/jwt.strategy.ts` | Passport JWT strategy |
| `guards/jwt-auth.guard.ts` | JWT authentication guard |
| `guards/roles.guard.ts` | Role-based access control guard |
| `guards/wallet-auth.guard.ts` | Wallet ownership verification guard |
| `decorators/roles.decorator.ts` | @Roles() decorator |
| `decorators/public.decorator.ts` | @Public() decorator |
| `decorators/current-user.decorator.ts` | @CurrentUser() decorator |

**Auth Endpoints:**
```
POST   /auth/nonce     - Request authentication nonce
POST   /auth/verify    - Verify wallet signature & get JWT token
POST   /auth/register  - Register new user with role (Admin only)
GET    /auth/profile   - Get current user profile
POST   /auth/refresh   - Refresh JWT token
```

**Authentication Flow:**
```
1. Client → POST /auth/nonce { walletAddress }
   └── Server returns { nonce, message }

2. Client signs message with wallet (MetaMask, etc.)

3. Client → POST /auth/verify { walletAddress, signature }
   └── Server verifies signature using ethers.js
   └── Returns { accessToken, user }

4. Client includes JWT in subsequent requests:
   └── Authorization: Bearer <accessToken>
```

---

**2. Cron Module** (`src/modules/cron/`)
Scheduled tasks for maintenance and sync.

| File | Description |
|------|-------------|
| `cron.module.ts` | Module configuration |
| `cron.service.ts` | Service dengan scheduled tasks |

**Scheduled Jobs:**
| Schedule | Task | Description |
|----------|------|-------------|
| Every Hour | `recalculatePortfolios()` | Update all user portfolio statistics |
| Every 5 Minutes | `syncBlockchainEvents()` | Sync events from blockchain to database |
| Every 10 Minutes | `cleanupExpiredData()` | Cleanup stale transactions |
| Daily at Midnight | `calculateDailyStats()` | Log daily statistics |

**Event Handlers Implemented:**
- `handleProjectCreatedEvent()` - Process ProjectCreated events
- `handleFarmerMintedEvent()` - Process FarmerMinted events
- `handleInvestedEvent()` - Process Invested events
- `handleProfitDepositedEvent()` - Process ProfitDeposited events
- `handleProfitClaimedEvent()` - Process ProfitClaimed events
- `handleRefundedEvent()` - Process Refunded events

---

**3. Refunds Module** (`src/modules/refunds/`)
Refund mechanism for failed projects.

| File | Description |
|------|-------------|
| `refunds.module.ts` | Module configuration |
| `refunds.service.ts` | Service dengan blockchain integration |
| `refunds.controller.ts` | Controller dengan 4 endpoints |
| `dto/mark-refundable.dto.ts` | DTO untuk mark project refundable |
| `dto/claim-refund.dto.ts` | DTO untuk claim refund |

**Refund Endpoints:**
```
POST   /refunds/mark-refundable  - Mark project as refundable (Admin)
POST   /refunds/claim            - Claim refund from project
GET    /refunds/projects         - Get all refundable projects
GET    /refunds/user/:userId     - Get user's refund claims
```

**Refund Flow:**
```
Admin marks project refundable:
  └── POST /refunds/mark-refundable { projectId, reason }
  └── Calls stomaTradeContract.markRefundable()
  └── Project status → REFUNDABLE

Investor claims refund:
  └── POST /refunds/claim { userId, projectId }
  └── Calls stomaTradeContract.claimRefund()
  └── Parses Refunded event
  └── Marks investment as refunded
  └── Updates portfolio
```

---

#### 📝 Files Modified

**`src/app.module.ts`**
```typescript
// Added imports:
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { CronModule } from './modules/cron/cron.module';
import { RefundsModule } from './modules/refunds/refunds.module';

// Added to imports array:
@Module({
  imports: [
    ScheduleModule.forRoot(),  // NEW
    AuthModule,                 // NEW
    CronModule,                 // NEW
    RefundsModule,              // NEW
    // ... existing modules
  ],
})
```

**`src/main.ts`**
```typescript
// Updated Swagger config with:
.setVersion('2.0')
.addBearerAuth({
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
}, 'JWT-auth')
.addTag('Authentication', 'Wallet-based authentication endpoints')
.addTag('Refunds', 'Refund management for failed projects')
// ... additional tags
```

---

#### 📊 Summary of Changes (v1.2.0)

| Category | Count | Details |
|----------|-------|---------|
| New Modules | 3 | auth, cron, refunds |
| New Files | 18 | DTOs, Services, Controllers, Guards, Decorators |
| New Endpoints | 9 | Auth: 5, Refunds: 4 |
| Scheduled Jobs | 4 | Portfolio, Events, Cleanup, Stats |
| Blockchain Integrations | 2 | markRefundable(), claimRefund() |

---

#### ✅ Updated Completion Status

| Module | Status | Blockchain |
|--------|--------|------------|
| Users | ✅ Complete | ❌ |
| Collectors | ✅ Complete | ❌ |
| Farmers | ✅ Complete | ❌ |
| Lands | ✅ Complete | ❌ |
| Files | ✅ Complete | ❌ |
| Buyers | ✅ Complete | ❌ |
| Projects | ✅ Complete | ❌ |
| Notifications | ✅ Complete | ❌ |
| Farmer Submissions | ✅ Complete | ✅ mintFarmerNFT() |
| Project Submissions | ✅ Complete | ✅ createProject() |
| Investments | ✅ Complete | ✅ invest() |
| Portfolios | ✅ Complete | ❌ (read-only) |
| Profits | ✅ Complete | ✅ depositProfit(), claimProfit() |
| **Auth** | ✅ **NEW** | ❌ (wallet signature via ethers) |
| **Cron** | ✅ **NEW** | ✅ (event sync) |
| **Refunds** | ✅ **NEW** | ✅ markRefundable(), claimRefund() |

---

### Version 1.1.0 - Blockchain Integration Complete (November 2025)

*See previous changelog entries above*

---

### Version 1.0.0 - Initial Release (November 2025)

#### Core Features
- ✅ NestJS framework setup
- ✅ Prisma ORM with PostgreSQL
- ✅ 8 CRUD modules (Users, Collectors, Farmers, Lands, Files, Buyers, Projects, Notifications)
- ✅ Blockchain module foundation (EthersProvider, PlatformWallet, Transaction, Contract, Event services)
- ✅ Farmer Submissions module with NFT minting workflow
- ✅ Swagger/OpenAPI documentation
- ✅ Global validation and pagination
- ✅ Soft delete implementation

---

## 🔮 Future Development Roadmap

### ✅ Completed (Moved from TODO)

1. ~~**Authentication Module**~~ ✅ v1.2.0
2. ~~**Event Sync Enhancement**~~ ✅ v1.2.0
3. ~~**Cron Jobs**~~ ✅ v1.2.0
4. ~~**Refund Mechanism**~~ ✅ v1.2.0

### 🔄 Remaining TODO

1. **IPFS Integration**
   - Upload project metadata to IPFS
   - Generate CID for NFT metadata
   - Pin metadata on Pinata/Infura

2. **Testing**
   - Unit tests for services
   - Integration tests for blockchain operations
   - E2E tests for complete workflows

3. **Rate Limiting**
   - Implement request throttling
   - Protect against DDoS attacks

4. **Logging to External Service**
   - Winston or Pino logger setup
   - Log aggregation (ELK Stack, Datadog)

5. **WebSocket Support**
   - Real-time notifications
   - Live blockchain event updates

---

## 📦 Required Dependencies

### Production
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

### Environment Variables (Updated)
```bash
# JWT Configuration (NEW)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Existing blockchain config...
BLOCKCHAIN_RPC_URL=https://rpc.sepolia-api.lisk.com
BLOCKCHAIN_CHAIN_ID=4202
STOMA_TRADE_ADDRESS=0x...
PLATFORM_WALLET_PRIVATE_KEY=0x...
```

---

---

### Version 1.3.0 - Swagger Enhancement & DTO Complete (November 2025)

#### 🔧 Enhanced Modules

All modules have been enhanced with complete Swagger documentation:

**DTOs Enhanced with @ApiProperty:**
- All request DTOs (Create, Update)
- All response DTOs with proper typing
- Pagination DTOs

**Controllers Enhanced with:**
- `@ApiTags` - Module grouping
- `@ApiOperation` - Endpoint descriptions
- `@ApiResponse` - Response types & status codes
- `@ApiParam` - Path parameters
- `@ApiQuery` - Query parameters
- `@ParseUUIDPipe` - UUID validation

#### 📝 Files Modified (Per Module)

| Module | Files Enhanced |
|--------|----------------|
| **Users** | `user-response.dto.ts`, `update-user.dto.ts`, `users.controller.ts` |
| **Collectors** | `collector-response.dto.ts`, `create-collector.dto.ts`, `update-collector.dto.ts`, `collectors.controller.ts` |
| **Farmers** | `farmer-response.dto.ts`, `create-farmer.dto.ts`, `update-farmer.dto.ts`, `farmers.controller.ts` |
| **Lands** | `land-response.dto.ts`, `create-land.dto.ts`, `update-land.dto.ts`, `lands.controller.ts` |
| **Projects** | `project-response.dto.ts`, `create-project.dto.ts`, `update-project.dto.ts`, `projects.controller.ts` |
| **Files** | `file-response.dto.ts`, `create-file.dto.ts`, `files.controller.ts` |
| **Buyers** | `buyer-response.dto.ts`, `buyer-history-response.dto.ts`, all create/update DTOs, `buyers.controller.ts` |
| **Notifications** | `notification-response.dto.ts`, all create DTOs, `notifications.controller.ts` |
| **Farmer Submissions** | `create-farmer-submission.dto.ts`, `approve-farmer-submission.dto.ts`, `reject-farmer-submission.dto.ts` |
| **Project Submissions** | `create-project-submission.dto.ts`, `approve-project-submission.dto.ts`, `reject-project-submission.dto.ts` |
| **Investments** | `create-investment.dto.ts` |
| **Profits** | `deposit-profit.dto.ts`, `claim-profit.dto.ts` |
| **Common** | `pagination.dto.ts` with full ApiProperty |

#### 📊 Swagger Features Added

```typescript
// Response DTO Example
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
  // ...
}

// Controller Example
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {}
}
```

#### 🌐 Swagger UI Access

```
http://localhost:3000/api
```

**Features:**
- Interactive API testing
- Request/Response schemas
- Try it out functionality
- Bearer token authentication support
- All endpoints documented

---

## 📊 Final Module Summary

| # | Module | Endpoints | Swagger | Blockchain |
|---|--------|-----------|---------|------------|
| 1 | Users | 5 | ✅ | ❌ |
| 2 | Collectors | 5 | ✅ | ❌ |
| 3 | Farmers | 6 | ✅ | ❌ |
| 4 | Lands | 6 | ✅ | ❌ |
| 5 | Files | 5 | ✅ | ❌ |
| 6 | Buyers | 9 | ✅ | ❌ |
| 7 | Projects | 7 | ✅ | ❌ |
| 8 | Notifications | 11 | ✅ | ❌ |
| 9 | Farmer Submissions | 5 | ✅ | ✅ |
| 10 | Project Submissions | 5 | ✅ | ✅ |
| 11 | Investments | 5 | ✅ | ✅ |
| 12 | Portfolios | 4 | ✅ | ❌ |
| 13 | Profits | 5 | ✅ | ✅ |
| 14 | Auth | 5 | ✅ | ❌ |
| 15 | Cron | - | N/A | ✅ |
| 16 | Refunds | 4 | ✅ | ✅ |

**Totals:**
- 📡 **~82 Endpoints**
- 📝 **16 Modules**
- ⛓️ **7 Blockchain Functions**
- ⏰ **4 Scheduled Jobs**

---

*Last Updated: November 2025*

