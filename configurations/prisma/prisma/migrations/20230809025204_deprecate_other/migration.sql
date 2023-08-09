-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "other" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "other" DROP NOT NULL;
