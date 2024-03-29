// Copyright 2023-2024 Light, Inc.
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
  mainnet,
  base,
  polygon,
  optimism,
  sepolia,
  polygonMumbai,
  arbitrum,
  gnosis,
  bsc,
  avalanche,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  celo,
  blastSepolia,
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
  base,
  arbitrum,
  celo,
  avalanche,
] as readonly [Chain, ...Chain[]];

// -----------------------------------------------------------------------------
// Testnet
// -----------------------------------------------------------------------------

export const TESTNET_CHAINS = [
  polygonMumbai,
  baseSepolia,
  arbitrumSepolia,
  sepolia,
  optimismSepolia,
  blastSepolia,
] as readonly [Chain, ...Chain[]];

// -----------------------------------------------------------------------------
// All
// -----------------------------------------------------------------------------

export const CHAINS = [...MAINNET_CHAINS, ...TESTNET_CHAINS] as const;
