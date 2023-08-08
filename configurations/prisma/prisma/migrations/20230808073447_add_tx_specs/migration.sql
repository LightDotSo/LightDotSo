/*
  Warnings:

  - A unique constraint covering the columns `[address,chainId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wallet_chainId_address_key";

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "topics" TEXT[],
    "data" TEXT NOT NULL,
    "blockHash" TEXT,
    "blockNumber" TEXT,
    "transactionHash" TEXT,
    "transactionIndex" TEXT,
    "logIndex" TEXT,
    "transactionLogIndex" TEXT,
    "logType" TEXT,
    "removed" BOOLEAN,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" TEXT NOT NULL,
    "blockHash" TEXT,
    "blockNumber" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "cumulativeGasUsed" TEXT NOT NULL,
    "gas_used" TEXT,
    "contractAddress" TEXT,
    "status" TEXT,
    "root" TEXT,
    "logsBloom" TEXT NOT NULL,
    "transactionType" TEXT,
    "effectiveGasPrice" TEXT,
    "other" JSONB NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "blockHash" TEXT,
    "blockNumber" TEXT,
    "transactionIndex" TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT,
    "value" TEXT NOT NULL,
    "gas_price" TEXT,
    "gas" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "v" TEXT NOT NULL,
    "r" TEXT NOT NULL,
    "s" TEXT NOT NULL,
    "transactionType" TEXT,
    "maxPriorityFeePerGas" TEXT,
    "maxFeePerGas" TEXT,
    "other" JSONB NOT NULL,
    "chainId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_transactionHash_key" ON "Receipt"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_chainId_key" ON "Wallet"("address", "chainId");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Receipt"("transactionHash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;
