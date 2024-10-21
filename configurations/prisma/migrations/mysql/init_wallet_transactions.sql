CREATE TABLE `_TransactionToWallet` (
`A` varchar(191) NOT NULL,
`B` varchar(191) NOT NULL,
UNIQUE KEY `_TransactionToWallet_AB_unique` (`A`, `B`),
KEY `_TransactionToWallet_B_index` (`B`)
) ENGINE InnoDB,
CHARSET utf8mb4,
COLLATE utf8mb4_unicode_ci;
