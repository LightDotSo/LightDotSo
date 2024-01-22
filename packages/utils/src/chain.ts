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

import {
  CHAINS,
  SIMPLEHASH_CHAIN_ID_MAPPING,
  CHAIN_ID_LABELS,
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
