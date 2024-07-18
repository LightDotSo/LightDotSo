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

import type { Swap } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const swapParser = createParser({
  parse: function (value) {
    // If the value is empty, return null
    if (value === "") {
      return null;
    }

    // Parse the token w/ "|"
    const [address, chainId, quantity, groupId] = value.split("|");
    // Parse the address as a string (if possible)
    const parsedAddress = address === "_" ? undefined : address;
    // Parse the decimals as a integer (if possible)
    const parsedChainId = chainId !== "0" ? parseInt(chainId) : undefined;
    // Parse the value as a float (if possible)
    const parsedQuantity = quantity !== "0" ? parseFloat(quantity) : undefined;
    // Parse the group ID as a string (if possible)
    const parsedGroupId = groupId === "_" ? undefined : groupId;

    // Check if the address is valid, the decimals is a integer, and the value is a float
    if (parsedAddress && isAddress(parsedAddress) && parsedGroupId) {
      return {
        address: parsedAddress,
        chainId: parsedChainId,
        quantity: parsedQuantity,
        groupId: parsedGroupId,
      };
    }

    return null;
  },

  serialize: function (value: Swap | null) {
    // If the value is empty, return an empty string
    if (!value) {
      return "";
    }

    // Serialize the token as a string w/ "|" delimiter
    return `${value?.address ?? "_"}|${
      value && "chainId" in value && typeof value.chainId !== "undefined"
        ? value.chainId
        : 0
    }|${value && "quantity" in value && typeof value.quantity !== "undefined" ? value.quantity : 0}|${value && "groupId" in value && typeof value.groupId !== "undefined" ? value.groupId : "_"}`;
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useSwapQueryState = (initialSwap?: Swap) => {
  return useQueryState(
    "swap",
    swapParser.withDefault(initialSwap ?? {}).withOptions({
      throttleMs: 3000,
    }),
  );
};
