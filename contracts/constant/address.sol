// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

// -------------------------------------------------------------------------
// Addresses
// -------------------------------------------------------------------------

// Deployer address
address constant PRIVATE_KEY_DEPLOYER = address(0x81a2500fa1ae8eB96a63D7E8b6b26e6cabD2C9c0);

// SimpleAccountFactory address
address constant SIMPLE_ACCOUNT_FACTORY_ADDRESS =
    address(0x223827826Fe82e8B445c3a5Fee6C7a8a4F1DEE9c);

// ImmutableCreate2Factory address
address constant IMMUTABLE_CREATE2_FACTORY_ADDRESS =
    address(0x0000000000FFe8B47B3e2130213B802212439497);

// Create2Deployer address
address constant CREATE2_DEPLOYER_ADDRESS_RAW = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
address constant CREATE2_DEPLOYER_ADDRESS = address(CREATE2_DEPLOYER_ADDRESS_RAW);

// EntryPoint address
address payable constant ENTRYPOINT_V060_ADDRESS =
    payable(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
address payable constant ENTRYPOINT_V070_ADDRESS =
    payable(address(0x0000000071727De22E5E9d8BAf0edAc6f37da032));
address payable constant ENTRYPOINT_ADDRESS = ENTRYPOINT_V070_ADDRESS;

// LightDAG address
address constant LIGHT_DAG_ADDRESS = address(0x0000000000000000000000000000000000000000);

// LightPaymaster address
address payable constant LIGHT_PAYMASTER_V010_ADDRESS =
    payable(address(0x000000000018d32DF916ff115A25fbeFC70bAf8b));
address payable constant LIGHT_PAYMASTER_ADDRESS = LIGHT_PAYMASTER_V010_ADDRESS;

// LightPaymaster implementation address
address constant LIGHT_PAYMASTER_V010_IMPLEMENTATION_ADDRESS =
    address(0x000000000018d32DF916ff115A25fbeFC70bAf8b);
address constant LIGHT_PAYMASTER_IMPLEMENTATION_ADDRESS =
    LIGHT_PAYMASTER_V010_IMPLEMENTATION_ADDRESS;

// LightProtocolController address
address constant LIGHT_PROTOCOL_CONTROLLER_V010_ADDRESS =
    address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);
address constant LIGHT_PROTOCOL_CONTROLLER_ADDRESS = LIGHT_PROTOCOL_CONTROLLER_V010_ADDRESS;

// LightProtocolController implementation address
address constant LIGHT_PROTOCOL_CONTROLLER_V010_IMPLEMENTATION_ADDRESS =
    address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);
address constant LIGHT_PROTOCOL_CONTROLLER_IMPLEMENTATION_ADDRESS =
    LIGHT_PROTOCOL_CONTROLLER_V010_IMPLEMENTATION_ADDRESS;

// LightTimelockControllerFactory address
address constant LIGHT_TIMELOCK_CONTROLLER_FACTORY_V010_ADDRESS =
    address(0x0000000000f5A79Ab578707422Ec1BA4E5AfCb2d);
address constant LIGHT_TIMELOCK_CONTROLLER_FACTORY_ADDRESS =
    LIGHT_TIMELOCK_CONTROLLER_FACTORY_V010_ADDRESS;

// LightVaultFactory address
address constant LIGHT_VAULT_FACTORY_V010_ADDRESS =
    address(0x0000000000000000000000000000000000000000);
address constant LIGHT_VAULT_FACTORY_ADDRESS = LIGHT_VAULT_FACTORY_V010_ADDRESS;

// LightWalletFactory address
address constant LIGHT_WALLET_FACTORY_V010_ADDRESS =
    address(0x0000000000756D3E6464f5efe7e413a0Af1C7474);
address constant LIGHT_WALLET_FACTORY_V020_ADDRESS =
    address(0x00000000001269b052C004FFB71B47AB22C898B0);
address constant LIGHT_WALLET_FACTORY_V030_ADDRESS =
    address(0x000000000048C2e27c97B9978c9B27f6937A40db);
address constant LIGHT_WALLET_FACTORY_ADDRESS = LIGHT_WALLET_FACTORY_V030_ADDRESS;

// Light Master Wallet address
address constant LIGHT_MASTER_WALLET_ADDRESS = address(0x2b4813aDA463bAcE516160E25A65dD211c8E9135);

// OffchainVerifier address for paymaster
// v1: address internal constant OFFCHAIN_VERIFIER_ADDRESS =
// address(0x514a099c7eC404adF25e3b6b6A3523Ac3A4A778F);
// v2: address internal constant OFFCHAIN_VERIFIER_ADDRESS =
// address(0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17);
// v3: address internal constant OFFCHAIN_VERIFIER_ADDRESS =
// address(0x0618fE3A19a4980a0202aDBdb5201e74cD9908ff);
address constant OFFCHAIN_VERIFIER_ADDRESS = address(0xEEdeadba8cAC470fDCe318892a07aBE26Aa4ab17);

address constant NEXUS_V010_IMPLEMENTATION_ADDRESS =
    address(0x07cfA02a1e80C83e7Bb2186E82742151d26AD7f1);

address constant COLD_STORAGE_HOOK_V010_IMPLEMENTATION_ADDRESS =
    address(0x7E31543b269632ddc55a23553f902f84C9DD8454);

address constant REGISTRY_V010_ADDRESS = address(0x000000000069E2a187AEFFb852bF3cCdC95151B2);
