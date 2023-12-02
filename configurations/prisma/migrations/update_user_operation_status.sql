UPDATE `UserOperation`
SET status = 'EXECUTED'
WHERE `transactionHash` IS NOT NULL;
