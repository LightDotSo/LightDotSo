-- DropForeignKey
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_configurationId_fkey";

-- AlterTable
ALTER TABLE "Owner" ALTER COLUMN "configurationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
