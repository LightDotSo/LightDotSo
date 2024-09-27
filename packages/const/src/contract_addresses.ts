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
  V010_FACTORY = "v0.1.0 Factory",
  V020_FACTORY = "v0.2.0 Factory",
  V010_IMPLEMENTATION = "v0.1.0 Implementation",
  V020_IMPLEMENTATION = "v0.2.0 Implementation",
  V060_ENTRYPOINT = "v0.6.0 Entrypoint",
  V070_ENTRYPOINT = "v0.7.0 Entrypoint",
  IMMUTABLE_CREATE2_FACTORY_ADDRESS = "Immutable Create2 Factory Address",
}

export const CONTRACT_ADDRESSES: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.V010_FACTORY]: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
  [ContractAddress.V020_FACTORY]: "0x00000000001269b052C004FFB71B47AB22C898B0",
  [ContractAddress.V010_IMPLEMENTATION]:
    "0x8FB3cFDf2082C2be7D3205D361067748Ea1aBF63",
  [ContractAddress.V020_IMPLEMENTATION]:
    "0x040D53C5DDE1762F7cac48d5467E88236d4873d7",
  [ContractAddress.V060_ENTRYPOINT]:
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  [ContractAddress.V070_ENTRYPOINT]:
    "0x0000000071727de22e5e9d8baf0edac6f37da032",
  [ContractAddress.IMMUTABLE_CREATE2_FACTORY_ADDRESS]:
    "0x0000000000ffe8b47b3e2130213b802212439497",
};

// @ts-expect-error
export const WALLET_FACTORY_ENTRYPOINT_MAPPING: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.V010_FACTORY]:
    CONTRACT_ADDRESSES[ContractAddress.V060_ENTRYPOINT],
  [ContractAddress.V020_FACTORY]:
    CONTRACT_ADDRESSES[ContractAddress.V060_ENTRYPOINT],
};

// @ts-expect-error
export const WALLET_FACTORY_IMPLEMENTATION_MAPPING: {
  readonly [key in ContractAddress]: Address;
} = {
  [ContractAddress.V010_FACTORY]:
    CONTRACT_ADDRESSES[ContractAddress.V010_IMPLEMENTATION],
  [ContractAddress.V020_FACTORY]:
    CONTRACT_ADDRESSES[ContractAddress.V020_IMPLEMENTATION],
};

export const PROXY_IMPLEMENTAION_VERSION_MAPPING: {
  readonly [key: Address]: string;
} = {
  [CONTRACT_ADDRESSES[ContractAddress.V010_IMPLEMENTATION]]: "v0.1.0",
  [CONTRACT_ADDRESSES[ContractAddress.V020_IMPLEMENTATION]]: "v0.2.0",
};

export const LATEST_IMPLEMENTATION_ADDRESS: Address =
  CONTRACT_ADDRESSES[ContractAddress.V020_IMPLEMENTATION];
