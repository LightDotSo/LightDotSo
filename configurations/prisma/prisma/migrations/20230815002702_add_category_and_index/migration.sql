-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "Log_topics_idx" ON "Log" USING GIN ("topics" array_ops);
