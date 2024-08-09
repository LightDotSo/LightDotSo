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

"use client";

import type { AI } from "@/chat/actions";
import { useActions, useUIState } from "ai/rsc";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface Stock {
  symbol: string;
  price: number;
  delta: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function Stocks({ props: stocks }: { props: Stock[] }) {
  const [, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
        {stocks.map((stock) => (
          // biome-ignore lint/a11y/useButtonType: <explanation>
          <button
            key={stock.symbol}
            className="flex cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-2 text-left hover:bg-zinc-700 sm:w-52"
            onClick={async () => {
              const response = await submitUserMessage(`View ${stock.symbol}`);
              setMessages((currentMessages) => [...currentMessages, response]);
            }}
          >
            <div
              className={`text-xl ${
                stock.delta > 0 ? "text-green-600" : "text-red-600"
              } flex w-11 flex-row justify-center rounded-md bg-white/10 p-2`}
            >
              {stock.delta > 0 ? "↑" : "↓"}
            </div>
            <div className="flex flex-col">
              <div className="bold text-zinc-300 uppercase">{stock.symbol}</div>
              <div className="text-base text-zinc-500">
                ${stock.price.toExponential(1)}
              </div>
            </div>
            <div className="ml-auto flex flex-col">
              <div
                className={`${
                  stock.delta > 0 ? "text-green-600" : "text-red-600"
                } bold text-right uppercase`}
              >
                {` ${((stock.delta / stock.price) * 100).toExponential(1)}%`}
              </div>
              <div
                className={`${
                  stock.delta > 0 ? "text-green-700" : "text-red-700"
                } text-right text-base`}
              >
                {stock.delta.toExponential(1)}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 text-center text-sm text-zinc-500">
        Note: Data and latency are simulated for illustrative purposes and
        should not be considered as financial advice.
      </div>
    </div>
  );
}
