ALTER TABLE `Signature` CHANGE `signature_type` `signatureType` VARCHAR(191);

UPDATE `UserOperation` SET `signatureType` = `signature_type`;
