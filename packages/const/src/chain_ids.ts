// Copyright 2023-2024 Light.
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

export enum Chain {
  MAINNET = "ethereum",
  OPTIMISM = "optimism",
  CELO = "celo",
  POLYGON = "polygon",
  BASE = "base",
  ARBITRUM = "arbitrum",
  AVALANCHE = "avalanche",
  GNOSIS = "gnosis",
  SEPOLIA = "sepolia",
}

export const CHAIN_IDS: { readonly [key in Chain]: number } = {
  [Chain.MAINNET]: 1,
  [Chain.OPTIMISM]: 10,
  [Chain.GNOSIS]: 100,
  [Chain.POLYGON]: 137,
  [Chain.BASE]: 8453,
  [Chain.ARBITRUM]: 42161,
  [Chain.AVALANCHE]: 43114,
  [Chain.CELO]: 42220,
  [Chain.SEPOLIA]: 11155111,
};

export const CHAIN_ID_LABELS: { readonly [key: number]: Chain } =
  Object.entries(CHAIN_IDS).reduce(
    (acc, [chain, id]) => {
      acc[id] = chain as Chain;
      return acc;
    },
    {} as { [key: number]: Chain },
  );
