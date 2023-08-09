/*
  Warnings:

  - You are about to drop the column `other` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Receipt_transactionHash_key";

-- DropIndex
DROP INDEX "Transaction_hash_key";

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "other";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "other";
