/*
  Warnings:

  - Added the required column `factoryAddress` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "factoryAddress" TEXT NOT NULL;
