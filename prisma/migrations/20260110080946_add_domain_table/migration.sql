-- CreateTable
CREATE TABLE "domains" (
    "id" SERIAL NOT NULL,
    "domainCode" TEXT NOT NULL,
    "domainDesc" TEXT NOT NULL,
    "domainStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domains_domainCode_key" ON "domains"("domainCode");
