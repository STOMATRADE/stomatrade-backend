-- CreateTable
CREATE TABLE "AppProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "abi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AppProject_pkey" PRIMARY KEY ("id")
);
