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

import type {
  SimplehashMainnetChain,
  SimplehashTestnetChain,
} from "@lightdotso/schemas";

// Define the chain ID mapping objects
export const SIMPLEHASH_MAINNET_CHAIN_ID_MAPPING: Record<
  SimplehashMainnetChain,
  number
> = {
  ethereum: 1,
  polygon: 137,
  optimism: 10,
  arbitrum: 42161,
  "arbitrum-nova": 42170,
  avalanche: 43114,
  base: 8453,
  bsc: 56,
  celo: 42220,
  gnosis: 100,
  linea: 59144,
  "polygon-zkevm": 1101,
  scroll: 534352,
  zora: 7777777,
};

export const SIMPLEHASH_TESTNET_CHAIN_ID_MAPPING: Record<
  SimplehashTestnetChain,
  number
> = {
  "ethereum-sepolia": 11155111,
  "polygon-mumbai": 80001,
  "avalanche-fuji": 43113,
  "bsc-testnet": 97,
  "frame-testnet": 68840142,
  "linea-testnet": 59140,
  "polygon-zkevm-testnet": 1442,
  "scroll-sepolia": 534351,
  "zora-testnet": 999999999,
};

export const SIMPLEHASH_CHAIN_ID_MAPPING: Record<
  SimplehashMainnetChain | SimplehashTestnetChain,
  number
> = {
  ...SIMPLEHASH_MAINNET_CHAIN_ID_MAPPING,
  ...SIMPLEHASH_TESTNET_CHAIN_ID_MAPPING,
};

export const SIMPLEHASH_MAX_COUNT = 50;
