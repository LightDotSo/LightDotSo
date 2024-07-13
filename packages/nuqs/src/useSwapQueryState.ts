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
  parse: function (val) {
    // If the value is empty, return null
    if (val === "") {
      return null;
    }

    // Split the value into chainId and token w/ ":"
    const [chainId, token] = val.split(":");

    // Parse the token w/ "|"
    const [address, decimals, value] = token.split("|");
    // Parse the address as a string (if possible)
    const parsedAddress = address === "_" ? undefined : address;
    // Parse the decimals as a integer (if possible)
    const parsedDecimals = parseInt(decimals);
    // Parse the value as a float (if possible)
    const parsedValue = parseFloat(value);

    // Check if the address is valid, the decimals is a integer, and the value is a float
    if (
      parsedAddress &&
      isAddress(parsedAddress) &&
      !isNaN(parsedDecimals) &&
      !isNaN(parsedValue)
    ) {
      return {
        chainId: parseInt(chainId),
        token: {
          address: parsedAddress,
          decimals: parsedDecimals,
          quantity: parsedValue,
        },
      };
    }

    return null;
  },

  serialize: function (val: Swap) {
    // If the value is empty, return an empty string
    if (!val) {
      return "";
    }

    // Serialize the token as a string w/ "|" delimiter
    const token = val.token;
    const tokenString = `${token?.address ?? "_"}|${
      token && "decimals" in token ? token.decimals : 0
    }|${
      token && "quantity" in token ? token.quantity : 0
    }${token && "value" in token ? `|${token.value}` : ""}`;

    // Serialize the chainId and token w/ ":" delimiter
    return `${val?.chainId ?? 0}:${tokenString}`;
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
