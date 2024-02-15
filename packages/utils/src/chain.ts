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
  CHAINS,
  SIMPLEHASH_CHAIN_ID_MAPPING,
  CHAIN_ID_LABELS,
  TESTNET_CHAINS,
  MAINNET_CHAINS,
} from "@lightdotso/const";
import type { Chain } from "viem";
import { extractChain } from "viem";

export function getChainById(chainId: number): Chain {
  return extractChain({ chains: CHAINS, id: chainId });
}

export function getChainNameById(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name ?? "Unknown";
}

export function getChainLabelById(chainId: number): string {
  if (chainId in CHAIN_ID_LABELS) {
    const chain = CHAIN_ID_LABELS[chainId];
    return chain;
  }
  return "ethereum";
}

export function getChainIdBySimplehashChainName(chain: string): number {
  if (chain in SIMPLEHASH_CHAIN_ID_MAPPING) {
    const chainId =
      SIMPLEHASH_CHAIN_ID_MAPPING[
        chain as keyof typeof SIMPLEHASH_CHAIN_ID_MAPPING
      ];
    return chainId;
  } else {
    return 1;
  }
}

export function getChainBySimplehashChainName(chain: string): Chain {
  const chainId = getChainIdBySimplehashChainName(chain);
  const chainInfo = getChainById(chainId);
  return chainInfo;
}

export function isTestnet(chainId: number): boolean {
  return (
    TESTNET_CHAINS.some(chain => chain.id === chainId) ||
    !MAINNET_CHAINS.some(chain => chain.id === chainId)
  );
}
