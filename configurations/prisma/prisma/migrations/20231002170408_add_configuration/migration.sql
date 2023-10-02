/*
  Warnings:

  - You are about to drop the column `hash` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "hash";

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "threshold" BIGINT NOT NULL,
    "nonce" BIGINT NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "weight" BIGINT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configurationId" TEXT NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_address_key" ON "Configuration"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_imageHash_nonce_key" ON "Configuration"("imageHash", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_address_key" ON "Owner"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_address_weight_key" ON "Owner"("address", "weight");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_address_fkey" FOREIGN KEY ("address") REFERENCES "Configuration"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
