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

import type { Chain } from "viem";
import { CHAINS } from "@/const/chains";
import { SIMPLEHASH_CHAIN_ID_MAPPING } from "@/const/simplehash";

export function getChainById(chainId: number): Chain {
  const chain = CHAINS.find(chain => chain.id === chainId)!;
  return chain;
}

export function getChainNameById(chainId: number): string {
  const chain = CHAINS.find(chain => chain.id === chainId);
  return chain?.name ?? "Unknown";
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
