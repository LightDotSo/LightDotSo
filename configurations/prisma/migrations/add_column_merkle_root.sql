ALTER TABLE `Signature` ADD COLUMN `userOperationMerkleRoot` varchar(191);
ALTER TABLE `UserOperation` ADD COLUMN `userOperationMerkleRoot` varchar(191);
