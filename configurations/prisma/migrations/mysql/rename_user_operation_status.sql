ALTER TABLE `UserOperation` MODIFY `status` VARCHAR(50);

UPDATE `UserOperation` SET `status` = UPPER(`status`);

ALTER TABLE `UserOperation` MODIFY `status` ENUM('PROPOSED', 'PENDING', 'EXECUTED', 'REVERTED');
