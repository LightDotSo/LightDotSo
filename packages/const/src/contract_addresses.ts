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

import type { Address } from "viem";

export enum ContractAddress {
  ENTRYPOINT_V060_ADDRESS = "Entrypoint v0.6.0",
  ENTRYPOINT_V070_ADDRESS = "Entrypoint v0.7.0",
  CREATE2_DEPLOYER_ADDRESS = "Create2 Deployer Address",
  IMMUTABLE_CREATE2_FACTORY_ADDRESS = "Immutable Create2 Factory Address",
  LIGHT_WALLET_FACTORY_V010_ADDRESS = "Light Wallet Factory v0.1.0",
  LIGHT_WALLET_FACTORY_V020_ADDRESS = "Light Wallet Factory v0.2.0",
  LIGHT_WALLET_FACTORY_V030_ADDRESS = "Light Wallet Factory v0.3.0",
  LIGHT_WALLET_FACTORY_V010_IMPLEMENTATION = "Light Wallet Factory v0.1.0 Implementation",
  LIGHT_WALLET_FACTORY_V020_IMPLEMENTATION = "Light Wallet Factory v0.2.0 Implementation",
  LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION = "Light Wallet Factory v0.3.0 Implementation",
}

export const CONTRACT_ADDRESSES: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.LIGHT_WALLET_FACTORY_V010_ADDRESS]:
    "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
  [ContractAddress.LIGHT_WALLET_FACTORY_V020_ADDRESS]:
    "0x00000000001269b052C004FFB71B47AB22C898B0",
  [ContractAddress.LIGHT_WALLET_FACTORY_V030_ADDRESS]:
    "0x000000000048C2e27c97B9978c9B27f6937A40db",
  [ContractAddress.LIGHT_WALLET_FACTORY_V010_IMPLEMENTATION]:
    "0x8FB3cFDf2082C2be7D3205D361067748Ea1aBF63",
  [ContractAddress.LIGHT_WALLET_FACTORY_V020_IMPLEMENTATION]:
    "0x040D53C5DDE1762F7cac48d5467E88236d4873d7",
  [ContractAddress.LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION]:
    "0x5d02b6345898b193b66ca89e7a693cc11dc72954",
  [ContractAddress.ENTRYPOINT_V060_ADDRESS]:
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  [ContractAddress.ENTRYPOINT_V070_ADDRESS]:
    "0x0000000071727de22e5e9d8baf0edac6f37da032",
  [ContractAddress.CREATE2_DEPLOYER_ADDRESS]:
    "0x4e59b44847b379578588920cA78FbF26c0B4956C",
  [ContractAddress.IMMUTABLE_CREATE2_FACTORY_ADDRESS]:
    "0x0000000000ffe8b47b3e2130213b802212439497",
};

// @ts-expect-error
export const WALLET_FACTORY_ENTRYPOINT_MAPPING: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.LIGHT_WALLET_FACTORY_V010_ADDRESS]:
    CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V060_ADDRESS],
  [ContractAddress.LIGHT_WALLET_FACTORY_V020_ADDRESS]:
    CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V060_ADDRESS],
  [ContractAddress.LIGHT_WALLET_FACTORY_V030_ADDRESS]:
    CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V070_ADDRESS],
};

// @ts-expect-error
export const WALLET_FACTORY_IMPLEMENTATION_MAPPING: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.LIGHT_WALLET_FACTORY_V010_ADDRESS]:
    CONTRACT_ADDRESSES[
      ContractAddress.LIGHT_WALLET_FACTORY_V010_IMPLEMENTATION
    ],
  [ContractAddress.LIGHT_WALLET_FACTORY_V020_ADDRESS]:
    CONTRACT_ADDRESSES[
      ContractAddress.LIGHT_WALLET_FACTORY_V020_IMPLEMENTATION
    ],
  [ContractAddress.LIGHT_WALLET_FACTORY_V030_ADDRESS]:
    CONTRACT_ADDRESSES[
      ContractAddress.LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION
    ],
};

export const PROXY_IMPLEMENTAION_VERSION_MAPPING: {
  readonly [key: Address]: string;
} = {
  [CONTRACT_ADDRESSES[
    ContractAddress.LIGHT_WALLET_FACTORY_V010_IMPLEMENTATION
  ]]: "v0.1.0",
  [CONTRACT_ADDRESSES[
    ContractAddress.LIGHT_WALLET_FACTORY_V020_IMPLEMENTATION
  ]]: "v0.2.0",
  [CONTRACT_ADDRESSES[
    ContractAddress.LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION
  ]]: "v0.3.0",
};

export const LATEST_IMPLEMENTATION_ADDRESS: Address =
  CONTRACT_ADDRESSES[ContractAddress.LIGHT_WALLET_FACTORY_V030_IMPLEMENTATION];
