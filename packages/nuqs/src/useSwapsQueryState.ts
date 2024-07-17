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

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { Swap } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const swapsParser = createParser({
  parse: function (value) {
    if (value === "") {
      return [];
    }

    const swapPairs = value.split(";").map(pair => {
      const [from, to] = pair.split("->").map(swapStr => {
        const [address, chainId, quantity, groupId] = swapStr.split("|");
        const parsedAddress = address === "_" ? undefined : address;
        const parsedChainId = parseInt(chainId);
        const parsedQuantity = parseFloat(quantity);
        const parsedGroupId = groupId === "_" ? undefined : groupId;

        if (
          parsedAddress &&
          isAddress(parsedAddress) &&
          !isNaN(parsedChainId) &&
          !isNaN(parsedQuantity) &&
          parsedGroupId
        ) {
          return {
            address: parsedAddress,
            chainId: parsedChainId,
            quantity: parsedQuantity,
            groupId: parsedGroupId,
          };
        }
        return null;
      });

      // Check both from and to swaps are valid
      if (from && to) {
        return { from: from, to: to };
      }
      return null;
    });

    // Filter out any null values, return empty if no valid pairs exist
    const validSwapPairs = swapPairs.filter(pair => pair !== null);
    return validSwapPairs.length > 0 ? validSwapPairs : [];
  },
  serialize: function (value: Array<{ from: Swap; to: Swap }>) {
    if (!value) {
      return "";
    }

    const swapPairsString = value
      .map(({ from, to }) => {
        const serializeSwap = (swap: Swap) => {
          return `${swap?.address ?? "_"}|${swap?.chainId ?? 0}|${swap?.quantity ?? 0}${swap?.groupId ?? "_"}`;
        };

        return `${serializeSwap(from)}->${serializeSwap(to)}`;
      })
      .join(";");

    return swapPairsString;
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useSwapsQueryState = (
  initialSwaps: Array<{ from: Swap; to: Swap }>,
) => {
  return useQueryState(
    "swaps",
    swapsParser.withDefault(initialSwaps ?? []).withOptions({
      throttleMs: 3000,
    }),
  );
};
