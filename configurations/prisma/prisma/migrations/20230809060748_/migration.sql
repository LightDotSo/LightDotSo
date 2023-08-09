/*
  Warnings:

  - The `blockNumber` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionIndex` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `logIndex` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionLogIndex` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blockNumber` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gas_used` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionType` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `effectiveGasPrice` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blockNumber` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionIndex` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gas_price` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transactionType` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxPriorityFeePerGas` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxFeePerGas` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `transactionIndex` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cumulativeGasUsed` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nonce` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `chainId` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `chainId` on the `Wallet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "blockNumber",
ADD COLUMN     "blockNumber" INTEGER,
DROP COLUMN "transactionIndex",
ADD COLUMN     "transactionIndex" INTEGER,
DROP COLUMN "logIndex",
ADD COLUMN     "logIndex" BIGINT,
DROP COLUMN "transactionLogIndex",
ADD COLUMN     "transactionLogIndex" BIGINT;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "transactionIndex",
ADD COLUMN     "transactionIndex" INTEGER NOT NULL,
DROP COLUMN "blockNumber",
ADD COLUMN     "blockNumber" INTEGER,
DROP COLUMN "cumulativeGasUsed",
ADD COLUMN     "cumulativeGasUsed" BIGINT NOT NULL,
DROP COLUMN "gas_used",
ADD COLUMN     "gas_used" BIGINT,
DROP COLUMN "status",
ADD COLUMN     "status" INTEGER,
DROP COLUMN "transactionType",
ADD COLUMN     "transactionType" INTEGER,
DROP COLUMN "effectiveGasPrice",
ADD COLUMN     "effectiveGasPrice" BIGINT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "nonce",
ADD COLUMN     "nonce" BIGINT NOT NULL,
DROP COLUMN "blockNumber",
ADD COLUMN     "blockNumber" INTEGER,
DROP COLUMN "transactionIndex",
ADD COLUMN     "transactionIndex" INTEGER,
DROP COLUMN "gas_price",
ADD COLUMN     "gas_price" BIGINT,
DROP COLUMN "transactionType",
ADD COLUMN     "transactionType" INTEGER,
DROP COLUMN "maxPriorityFeePerGas",
ADD COLUMN     "maxPriorityFeePerGas" BIGINT,
DROP COLUMN "maxFeePerGas",
ADD COLUMN     "maxFeePerGas" BIGINT,
DROP COLUMN "chainId",
ADD COLUMN     "chainId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "chainId",
ADD COLUMN     "chainId" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_chainId_key" ON "Wallet"("address", "chainId");
