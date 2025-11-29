-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('ADMIN', 'STAFF', 'INVESTOR', 'COLLECTOR');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SUBMISSION_STATUS" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'MINTED');

-- CreateEnum
CREATE TYPE "PROJECT_STATUS" AS ENUM ('ACTIVE', 'SUCCESS', 'REFUNDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "TRANSACTION_STATUS" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('CREATE_PROJECT', 'MINT_FARMER_NFT', 'INVEST', 'DEPOSIT_PROFIT', 'CLAIM_PROFIT', 'REFUND', 'CLOSE_CROWDFUNDING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "ROLES" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collectors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "collectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "collectorId" TEXT NOT NULL,
    "tokenId" INTEGER,
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "GENDER" NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lands" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "reffId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "companyMail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_histories" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "buyerTransactionSuccess" INTEGER NOT NULL DEFAULT 0,
    "buyerTransactionFail" INTEGER NOT NULL DEFAULT 0,
    "buyerTier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "buyer_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER,
    "commodity" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "gradeQuality" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "landId" TEXT NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_notifications" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "channel_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "token_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_submissions" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "status" "SUBMISSION_STATUS" NOT NULL DEFAULT 'SUBMITTED',
    "submittedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "blockchainTxId" TEXT,
    "mintedTokenId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "farmer_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_submissions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "valueProject" TEXT NOT NULL,
    "maxCrowdFunding" TEXT NOT NULL,
    "metadataCid" TEXT,
    "status" "SUBMISSION_STATUS" NOT NULL DEFAULT 'SUBMITTED',
    "submittedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "blockchainTxId" TEXT,
    "mintedTokenId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "project_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "receiptTokenId" INTEGER,
    "transactionHash" TEXT,
    "blockNumber" INTEGER,
    "investedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_portfolios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalInvested" TEXT NOT NULL,
    "totalProfit" TEXT NOT NULL,
    "totalClaimed" TEXT NOT NULL,
    "activeInvestments" INTEGER NOT NULL DEFAULT 0,
    "completedInvestments" INTEGER NOT NULL DEFAULT 0,
    "avgROI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "investment_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_metadata" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "tokenType" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "metadataCid" TEXT NOT NULL,
    "metadataJson" TEXT,
    "name" TEXT,
    "description" TEXT,
    "image" TEXT,
    "attributes" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "nft_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transactions" (
    "id" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionType" "TRANSACTION_TYPE" NOT NULL,
    "status" "TRANSACTION_STATUS" NOT NULL DEFAULT 'PENDING',
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "blockNumber" INTEGER,
    "gasUsed" TEXT,
    "gasPrice" TEXT,
    "errorMessage" TEXT,
    "eventData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "blockchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit_pools" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalDeposited" TEXT NOT NULL,
    "totalClaimed" TEXT NOT NULL,
    "remainingProfit" TEXT NOT NULL,
    "lastDepositAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "profit_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit_claims" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profitPoolId" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transactionHash" TEXT,
    "blockNumber" INTEGER,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "profit_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "collectors_userId_key" ON "collectors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collectors_nik_key" ON "collectors"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "farmers_nik_key" ON "farmers"("nik");

-- CreateIndex
CREATE INDEX "files_reffId_idx" ON "files"("reffId");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_companyMail_key" ON "buyers"("companyMail");

-- CreateIndex
CREATE UNIQUE INDEX "channel_notifications_key_key" ON "channel_notifications"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_channelId_key" ON "notifications"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_submissions_farmerId_key" ON "farmer_submissions"("farmerId");

-- CreateIndex
CREATE INDEX "farmer_submissions_status_idx" ON "farmer_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_submissions_projectId_key" ON "project_submissions"("projectId");

-- CreateIndex
CREATE INDEX "project_submissions_status_idx" ON "project_submissions"("status");

-- CreateIndex
CREATE INDEX "investments_userId_idx" ON "investments"("userId");

-- CreateIndex
CREATE INDEX "investments_projectId_idx" ON "investments"("projectId");

-- CreateIndex
CREATE INDEX "investments_transactionHash_idx" ON "investments"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "investment_portfolios_userId_key" ON "investment_portfolios"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "nft_metadata_tokenId_key" ON "nft_metadata"("tokenId");

-- CreateIndex
CREATE INDEX "nft_metadata_tokenType_idx" ON "nft_metadata"("tokenType");

-- CreateIndex
CREATE INDEX "nft_metadata_ownerAddress_idx" ON "nft_metadata"("ownerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_transactions_transactionHash_key" ON "blockchain_transactions"("transactionHash");

-- CreateIndex
CREATE INDEX "blockchain_transactions_status_idx" ON "blockchain_transactions"("status");

-- CreateIndex
CREATE INDEX "blockchain_transactions_transactionType_idx" ON "blockchain_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "blockchain_transactions_transactionHash_idx" ON "blockchain_transactions"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "profit_pools_projectId_key" ON "profit_pools"("projectId");

-- CreateIndex
CREATE INDEX "profit_claims_userId_idx" ON "profit_claims"("userId");

-- CreateIndex
CREATE INDEX "profit_claims_profitPoolId_idx" ON "profit_claims"("profitPoolId");

-- CreateIndex
CREATE INDEX "profit_claims_transactionHash_idx" ON "profit_claims"("transactionHash");

-- AddForeignKey
ALTER TABLE "collectors" ADD CONSTRAINT "collectors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "collectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lands" ADD CONSTRAINT "lands_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_histories" ADD CONSTRAINT "buyer_histories_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_landId_fkey" FOREIGN KEY ("landId") REFERENCES "lands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_notifications" ADD CONSTRAINT "token_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_submissions" ADD CONSTRAINT "farmer_submissions_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_submissions" ADD CONSTRAINT "farmer_submissions_blockchainTxId_fkey" FOREIGN KEY ("blockchainTxId") REFERENCES "blockchain_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_blockchainTxId_fkey" FOREIGN KEY ("blockchainTxId") REFERENCES "blockchain_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_portfolios" ADD CONSTRAINT "investment_portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_pools" ADD CONSTRAINT "profit_pools_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_claims" ADD CONSTRAINT "profit_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_claims" ADD CONSTRAINT "profit_claims_profitPoolId_fkey" FOREIGN KEY ("profitPoolId") REFERENCES "profit_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_claims" ADD CONSTRAINT "profit_claims_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
