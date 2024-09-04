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

import type { Address } from "viem";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type ChainTokenPrices = {
  [tokenAddress: Address]: number;
};

type TokenPrices = {
  [chainId: string]: ChainTokenPrices;
};

type TokenPricesStore = {
  tokenPrices: TokenPrices;
  setTokenPrice: (
    chainId: number,
    tokenAddress: Address,
    price: number,
  ) => void;
  getTokenPrice: (chainId: number, tokenAddress: Address) => number | undefined;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTokenPrices = create(
  devtools(
    persist<TokenPricesStore>(
      (set, get) => ({
        tokenPrices: {},
        setTokenPrice: (chainId, tokenAddress, price) =>
          set((state) => {
            const chainIdString = chainId.toString();
            const updatedChainPrices: ChainTokenPrices = {
              ...(state.tokenPrices[chainIdString] || {}),
              [tokenAddress]: price,
            };
            return {
              tokenPrices: {
                ...state.tokenPrices,
                [chainIdString]: updatedChainPrices,
              },
            };
          }),
        getTokenPrice: (chainId, tokenAddress) => {
          const chainIdString = chainId.toString();
          const chainPrices = get().tokenPrices[chainIdString];
          return chainPrices ? chainPrices[tokenAddress] : undefined;
        },
      }),
      {
        name: "token-prices-state-v1",
        storage: createJSONStorage(() => sessionStorage, {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          reviver: (_key: string, value: any): any => {
            // Ignore functions during serialization
            if (typeof value === "function") {
              return undefined;
            }
            if (value && typeof value === "object" && value.type === "bigint") {
              return BigInt(value.value);
            }
            return value;
          },
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          replacer: (_key: string, value: any): any => {
            if (typeof value === "bigint") {
              return { type: "bigint", value: value.toString() };
            }
            return value;
          },
        }),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useTokenPrices",
      name: "TokenPricesStore",
      serialize: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        replacer: (_key: any, value: any) =>
          typeof value === "bigint" ? value.toString() : value,
      },
    },
  ),
);
