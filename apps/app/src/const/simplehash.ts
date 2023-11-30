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

import type { MainnetChain, TestnetChain } from "@lightdotso/schemas";

// Define the chain ID mapping objects
export const mainnetChainIdMapping: Record<MainnetChain, number> = {
  // Replace the numbers with actual chain IDs
  ethereum: 1,
  polygon: 137,
  optimism: 10,
  arbitrum: 42161,
  "arbitrum-nova": 5,
  avalanche: 6,
  base: 7,
  bsc: 8,
  celo: 9,
  gnosis: 100,
  linea: 11,
  "polygon-zkevm": 12,
  scroll: 13,
  "zksync-era": 14,
  zora: 15,
};

export const testnetChainIdMapping: Record<TestnetChain, number> = {
  // Replace the numbers with actual chain IDs
  "ethereum-sepolia": 16,
  "polygon-mumbai": 80001,
  "avalanche-fuji": 18,
  "bsc-testnet": 19,
  "frame-testnet": 20,
  "linea-testnet": 21,
  "optimism-goerli": 22,
  "polygon-zkevm-testnet": 23,
  "scroll-testnet": 24,
  "scroll-sepolia": 25,
  "zora-testnet": 26,
};

export const chainIdMapping: Record<MainnetChain | TestnetChain, number> = {
  ...mainnetChainIdMapping,
  ...testnetChainIdMapping,
};
