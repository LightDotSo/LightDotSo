/*
  Warnings:

  - Added the required column `configurationId` to the `Owner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Owner_address_key";

-- DropIndex
DROP INDEX "Owner_address_weight_key";

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "configurationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_address_fkey" FOREIGN KEY ("address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
