INSERT INTO `PaymasterOperation`
	(`id`, `sender`, `senderNonce`, `validUntil`, `validAfter`, `paymasterId`)
VALUES
	('clpjfg9o4000109jubux1hvx5', '0xe9586D5BB60179b9b364C19cE17B995cbE51Ce52', 0, FROM_UNIXTIME(0), FROM_UNIXTIME(1701075397), 'clpgodj200000n59aw4em4gfp');

UPDATE `UserOperation`
SET `paymasterOperationId` = 'clpjfg9o4000109jubux1hvx5'
WHERE `hash` = '0x1922d4ca42a4b5c99a3d8d0e9505a4b1fc3f3d46cb90fb514d1bf943655be64f';

INSERT INTO `PaymasterOperation`
	(`id`, `sender`, `senderNonce`, `validUntil`, `validAfter`, `paymasterId`)
VALUES
	('clpjfge7o000209ju2n5jhp2s', '0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F', 0, FROM_UNIXTIME(0), FROM_UNIXTIME(1701064996), 'clpgodj200000n59aw4em4gfp');

UPDATE `UserOperation`
SET `paymasterOperationId` = 'clpjfge7o000209ju2n5jhp2s'
WHERE `hash` = '0x6ec94c5d78c55aa88dd2bdaf2392a31f9cd0a71544c780cd4428143ae0fdb06f';
