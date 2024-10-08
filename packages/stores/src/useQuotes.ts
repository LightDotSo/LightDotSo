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

type QuoteParams = {
  fromChain: number | undefined;
  toChain: number | undefined;
  fromTokenAddress: Address | undefined;
  toTokenAddress: Address | undefined;
  fromAddress: Address | undefined;
  toAddress: Address | undefined;
  fromAmount: bigint | undefined;
  toAmount: bigint | undefined;
};

type QuotesStore = {
  quotes: QuoteParams[];
  resetQuotes: () => void;
  setQuote: (quote: QuoteParams) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useQuotes = create(
  devtools(
    persist<QuotesStore>(
      (set) => ({
        quotes: [],
        resetQuotes: () => set({ quotes: [] }),
        setQuote: (quote) =>
          set((state) => {
            // Filter out the quote if it already exists
            const newQuotes = state.quotes.filter(
              (oldQuote) =>
                oldQuote.fromChain !== quote.fromChain ||
                oldQuote.toChain !== quote.toChain ||
                oldQuote.fromTokenAddress !== quote.fromTokenAddress ||
                oldQuote.toTokenAddress !== quote.toTokenAddress ||
                oldQuote.fromAddress !== quote.fromAddress ||
                oldQuote.toAddress !== quote.toAddress,
            );

            return {
              ...state,
              quotes: [...newQuotes, quote],
            };
          }),
      }),
      {
        name: "quotes-state-v1",
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
      anonymousActionType: "useQuotes",
      name: "QuotesStore",
      serialize: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        replacer: (_key: any, value: any) =>
          typeof value === "bigint" ? value.toString() : value,
      },
    },
  ),
);
