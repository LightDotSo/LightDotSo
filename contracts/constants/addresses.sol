// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

// -------------------------------------------------------------------------
// Addresses
// -------------------------------------------------------------------------

// OffchainVerifier address for paymaster
// v1: address internal constant OFFCHAIN_VERIFIER_ADDRESS = address(0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F);
// v2: address internal constant OFFCHAIN_VERIFIER_ADDRESS = address(0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17);
// v3: address internal constant OFFCHAIN_VERIFIER_ADDRESS = address(0x0618fE3A19a4980a0202aDBdb5201e74cD9908ff);
address constant OFFCHAIN_VERIFIER_ADDRESS = address(0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17);

// Deployer address
address constant PRIVATE_KEY_DEPLOYER = address(0x81a2500fa1ae8eB96a63D7E8b6b26e6cabD2C9c0);

// EntryPoint address
address payable constant ENTRY_POINT_ADDRESS = ENTRY_POINT_V070_ADDRESS;
address payable constant ENTRY_POINT_V060_ADDRESS = payable(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
address payable constant ENTRY_POINT_V070_ADDRESS = payable(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));

// LightWalletFactory address
address constant LIGHT_FACTORY_ADDRESS = address(0x00000000001269b052C004FFB71B47AB22C898B0);
address constant LIGHT_FACTORY_V010_ADDRESS = address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);

// LightPaymaster address
// v1: address internal constant LIGHT_PAYMASTER_ADDRESS = address(0x000000000018d32DF916ff115A25fbeFC70bAf8b);
// v2: address internal constant LIGHT_PAYMASTER_ADDRESS = address(0x000000000003193FAcb32D1C120719892B7AE977);
// v3: address internal constant LIGHT_PAYMASTER_ADDRESS = address(0x000000000054230BA02ADD2d96fA4362A8606F97);
address constant LIGHT_PAYMASTER_ADDRESS = payable(address(0x000000000003193FAcb32D1C120719892B7AE977));

// LightTimelockControllerFactory address
address constant LIGHT_TIMELOCK_CONTROLLER_FACTORY_ADDRESS = address(0x0000000000f5A79Ab578707422Ec1BA4E5AfCb2d);

// Light Master Wallet address
address constant LIGHT_MASTER_WALLET_ADDRESS = address(0x2b4813aDA463bAcE516160E25A65dD211c8E9135);

// SimpleAccountFactory address
address constant SIMPLE_ACCOUNT_FACTORY_ADDRESS = address(0x223827826Fe82e8B445c3a5Fee6C7a8a4F1DEE9c);

// Create2Deployer address
address constant CREATE2_DEPLOYER_ADDRESS = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
