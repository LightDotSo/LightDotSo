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

import {
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
  avalanche,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  celo,
  cyber,
  fantom,
  gnosis,
  linea,
  lineaSepolia,
  mainnet,
  mantle,
  mode,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  polygonZkEvm,
  redstone,
  scroll,
  scrollSepolia,
  sei,
  seiDevnet,
  sepolia,
  zora,
} from "viem/chains";
import type { Chain } from "viem/chains";

// -----------------------------------------------------------------------------
// Mainnet
// -----------------------------------------------------------------------------

export const MAINNET_CHAINS = [
  mainnet,
  optimism,
  bsc,
  gnosis,
  polygon,
  fantom,
  redstone,
  polygonZkEvm,
  cyber,
  sei,
  mantle,
  base,
  mode,
  arbitrum,
  arbitrumNova,
  avalanche,
  celo,
  linea,
  blast,
  scroll,
  zora,
] as readonly [Chain, ...Chain[]];

// -----------------------------------------------------------------------------
// Testnet
// -----------------------------------------------------------------------------

export const TESTNET_CHAINS = [
  lineaSepolia,
  seiDevnet,
  polygonAmoy,
  baseSepolia,
  arbitrumSepolia,
  scrollSepolia,
  sepolia,
  optimismSepolia,
  blastSepolia,
] as readonly [Chain, ...Chain[]];

// -----------------------------------------------------------------------------
// Deprecated
// -----------------------------------------------------------------------------

export const DEPRECATED_CHAINS = [polygonMumbai] as readonly [
  Chain,
  ...Chain[],
];

// -----------------------------------------------------------------------------
// Special
// -----------------------------------------------------------------------------

export const LIGHT_CHAIN: Chain = {
  name: "All",
  id: 0,
  nativeCurrency: {
    name: "Light",
    symbol: "LIGHT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.light.so"],
    },
  },
};

// -----------------------------------------------------------------------------
// All
// -----------------------------------------------------------------------------

export const CHAINS = [...MAINNET_CHAINS, ...TESTNET_CHAINS] as const;
export const CHAINS_HISTORICAL = [...CHAINS, ...DEPRECATED_CHAINS] as const;
