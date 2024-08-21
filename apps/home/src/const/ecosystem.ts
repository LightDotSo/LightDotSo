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
  avalanche,
  base,
  blast,
  bsc,
  celo,
  cyber,
  fantom,
  gnosis,
  linea,
  mainnet,
  mantle,
  mode,
  optimism,
  polygon,
  polygonZkEvm,
  redstone,
  scroll,
  sei,
  zora,
} from "viem/chains";
import type { Chain } from "viem/chains";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type EcosystemChain = Chain & {
  description: string;
  websiteUrl: string;
};

// -----------------------------------------------------------------------------
// Mainnet
// -----------------------------------------------------------------------------

export const ECOSYSTEM_CHAINS = [
  {
    ...mainnet,
    description: "Ethereum Mainnet - The primary Ethereum blockchain network",
    websiteUrl: "https://ethereum.org",
  },
  {
    ...optimism,
    description: "Optimism - Layer 2 scaling solution for Ethereum",
    websiteUrl: "https://www.optimism.io",
  },
  {
    ...bsc,
    description: "Binance Smart Chain - Parallel blockchain to Binance Chain",
    websiteUrl: "https://www.bnbchain.org",
  },
  {
    ...gnosis,
    description: "Gnosis Chain (formerly xDai) - EVM compatible sidechain",
    websiteUrl: "https://www.gnosis.io",
  },
  {
    ...polygon,
    description: "Polygon - Ethereum scaling platform and framework",
    websiteUrl: "https://polygon.technology",
  },
  {
    ...fantom,
    description: "Fantom - High-performance, scalable, EVM-compatible platform",
    websiteUrl: "https://fantom.foundation",
  },
  {
    ...redstone,
    description: "RedStone - Oracle solution for blockchain networks",
    websiteUrl: "https://redstone.finance",
  },
  {
    ...polygonZkEvm,
    description: "Polygon zkEVM - Zero-knowledge scaling solution",
    websiteUrl: "https://polygon.technology/polygon-zkevm",
  },
  {
    ...cyber,
    description: "Cyber - Decentralized search engine and social network",
    websiteUrl: "https://cyber.co",
  },
  {
    ...sei,
    description: "Sei Network - Layer 1 blockchain optimized for trading",
    websiteUrl: "https://www.sei.io",
  },
  {
    ...mantle,
    description: "Mantle - Layer 2 scaling solution with modular architecture",
    websiteUrl: "https://www.mantle.xyz",
  },
  {
    ...base,
    description: "Base - Ethereum L2 incubated by Coinbase",
    websiteUrl: "https://base.org",
  },
  {
    ...mode,
    description: "Mode - Ethereum L2 with native yield for users and protocols",
    websiteUrl: "https://www.mode.network",
  },
  {
    ...arbitrum,
    description: "Arbitrum - Layer 2 scaling solution using optimistic rollups",
    websiteUrl: "https://arbitrum.io",
  },
  {
    ...arbitrumNova,
    description: "Arbitrum Nova - Lower cost version of Arbitrum",
    websiteUrl: "https://nova.arbitrum.io",
  },
  {
    ...avalanche,
    description:
      "Avalanche - High-throughput, fast finality smart contract platform",
    websiteUrl: "https://www.avax.network",
  },
  {
    ...celo,
    description: "Celo - Mobile-first blockchain platform",
    websiteUrl: "https://celo.org",
  },
  {
    ...linea,
    description: "Linea - Ethereum Layer 2 scaling solution",
    websiteUrl: "https://linea.build",
  },
  {
    ...blast,
    description: "Blast - Layer 2 with native yield",
    websiteUrl: "https://blast.io",
  },
  {
    ...scroll,
    description: "Scroll - zkEVM-based zkRollup Layer 2 solution",
    websiteUrl: "https://scroll.io",
  },
  {
    ...zora,
    description: "Zora - NFT-focused L2 network",
    websiteUrl: "https://zora.co",
  },
] as readonly [EcosystemChain, ...EcosystemChain[]];
