// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
