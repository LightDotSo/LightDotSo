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
  setQuote: (quote: QuoteParams) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useQuotes = create(
  devtools(
    persist<QuotesStore>(
      set => ({
        quotes: [],
        setQuote: quote => set(state => ({ quotes: [...state.quotes, quote] })),
      }),
      {
        name: "quotes-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useQuotes",
      name: "QuotesStore",
      serialize: {
        replacer: (_key: any, value: any) =>
          typeof value === "bigint" ? value.toString() : value,
      },
    },
  ),
);
