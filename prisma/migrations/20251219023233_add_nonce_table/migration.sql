-- CreateTable
CREATE TABLE "nonces" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nonces_walletAddress_idx" ON "nonces"("walletAddress");
