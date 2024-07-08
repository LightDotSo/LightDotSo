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
