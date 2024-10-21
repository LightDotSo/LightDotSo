ALTER TABLE `Signature` CHANGE `signature_type` `signatureType` VARCHAR(191);

UPDATE `Signature` SET `signatureType` = `signature_type`;
