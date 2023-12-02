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

import { z } from "zod";

export const simplehashMainnetChainSchema = z.enum([
  "ethereum",
  "polygon",
  "optimism",
  "arbitrum",
  "arbitrum-nova",
  "avalanche",
  "base",
  "bsc",
  "celo",
  "gnosis",
  "linea",
  "polygon-zkevm",
  "scroll",
  "zora",
]);

export const simplehashTestnetChainSchema = z.enum([
  // "ethereum-goerli",
  // "ethereum-rinkeby",
  "ethereum-sepolia",
  // "solana-devnet",
  // "solana-testnet",
  "polygon-mumbai",
  // "arbitrum-goerli",
  "avalanche-fuji",
  // "base-goerli",
  "bsc-testnet",
  "frame-testnet",
  // "godwoken-testnet",
  "linea-testnet",
  // "manta-testnet",
  // "optimism-goerli",
  // "palm-testnet",
  // "palm-testnet-edge",
  "polygon-zkevm-testnet",
  // "scroll-testnet",
  "scroll-sepolia",
  // "zksync-era-testnet",
  "zora-testnet",
]);

export const simplehashChainSchema = z.enum([
  ...simplehashMainnetChainSchema.options,
  ...simplehashTestnetChainSchema.options,
]);

export type SimplehashMainnetChain = z.infer<
  typeof simplehashMainnetChainSchema
>;
export type SimplehashTestnetChain = z.infer<
  typeof simplehashTestnetChainSchema
>;
