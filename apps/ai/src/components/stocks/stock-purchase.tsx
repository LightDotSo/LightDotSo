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

// Copyright 2023-2024 Vercel, Inc.
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
import { formatNumber } from "@/utils";
import { useAIState, useActions, useUIState } from "ai/rsc";
import { type ChangeEvent, type ReactNode, useId, useState } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface Purchase {
  numberOfShares?: number;
  symbol: string;
  price: number;
  status: "requires_action" | "completed" | "expired";
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function Purchase({
  props: { numberOfShares, symbol, price, status = "expired" },
}: {
  props: Purchase;
}) {
  const [value, setValue] = useState(numberOfShares || 100);
  const [purchasingUi, setPurchasingUi] = useState<null | ReactNode>(null);
  const [aiState, setAiState] = useAIState<typeof AI>();
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [, setMessages] = useUIState<typeof AI>();
  const { confirmPurchase } = useActions();

  // Unique identifier for this UI component.
  const id = useId();

  // Whenever the slider changes, we need to update the local value state and the history
  // so LLM also knows what's going on.
  function onSliderChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value);
    setValue(newValue);

    // Insert a hidden history info to the list.
    const message = {
      role: "system" as const,
      content: `[User has changed to purchase ${newValue} shares of ${name}. Total cost: $${(newValue * price).toFixed(2)}]`,

      // Identifier of this UI component, so we don't insert it many times.
      id,
    };

    // If last history state is already this info, update it. This is to avoid
    // adding every slider change to the history.
    if (aiState.messages[aiState.messages.length - 1]?.id === id) {
      setAiState({
        ...aiState,
        messages: [...aiState.messages.slice(0, -1), message],
      });

      return;
    }

    // If it doesn't exist, append it to history.
    setAiState({ ...aiState, messages: [...aiState.messages, message] });
  }

  return (
    <div className="rounded-xl border bg-zinc-950 p-4 text-green-400">
      <div className="float-right inline-block rounded-full bg-white/10 px-2 py-1 text-xs">
        +1.23% ↑
      </div>
      <div className="text-lg text-zinc-300">{symbol}</div>
      <div className="font-bold text-3xl">${price}</div>
      {purchasingUi ? (
        <div className="mt-4 text-zinc-200">{purchasingUi}</div>
      ) : status === "requires_action" ? (
        <>
          <div className="relative mt-6 pb-6">
            <p>Shares to purchase</p>
            <input
              id="labels-range-input"
              type="range"
              value={value}
              onChange={onSliderChange}
              min="10"
              max="1000"
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-zinc-600 accent-green-500 dark:bg-zinc-700"
            />
            <span className="absolute start-0 bottom-1 text-xs text-zinc-400">
              10
            </span>
            <span className="-translate-x-1/2 absolute start-1/3 bottom-1 text-xs text-zinc-400 rtl:translate-x-1/2">
              100
            </span>
            <span className="-translate-x-1/2 absolute start-2/3 bottom-1 text-xs text-zinc-400 rtl:translate-x-1/2">
              500
            </span>
            <span className="absolute end-0 bottom-1 text-xs text-zinc-400">
              1000
            </span>
          </div>

          <div className="mt-6">
            <p>Total cost</p>
            <div className="flex flex-wrap items-center font-bold text-xl sm:items-end sm:gap-2 sm:text-3xl">
              <div className="flex basis-1/3 flex-col tabular-nums sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
                {value}
                <span className="mb-1 font-normal text-sm text-zinc-600 sm:mb-0 dark:text-zinc-400">
                  shares
                </span>
              </div>
              <div className="basis-1/3 text-center sm:basis-auto">×</div>
              <span className="flex basis-1/3 flex-col tabular-nums sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
                ${price}
                <span className="mb-1 ml-1 font-normal text-sm text-zinc-600 sm:mb-0 dark:text-zinc-400">
                  per share
                </span>
              </span>
              <div className="mt-2 basis-full border-t border-t-zinc-700 pt-2 text-center sm:mt-0 sm:basis-auto sm:border-0 sm:pt-0 sm:text-left">
                = <span>{formatNumber(value * price)}</span>
              </div>
            </div>
          </div>

          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className="mt-6 w-full rounded-lg bg-green-400 px-4 py-2 font-bold text-zinc-900 hover:bg-green-500"
            onClick={async () => {
              const response = await confirmPurchase(symbol, price, value);
              setPurchasingUi(response.purchasingUI);

              // Insert a new system message to the UI.
              // setMessages((currentMessages: any) => [
              //   ...currentMessages,
              //   response.newMessage,
              // ]);
            }}
          >
            Purchase
          </button>
        </>
      ) : status === "completed" ? (
        <p className="mb-2 text-white">
          You have successfully purchased {value} ${symbol}. Total cost:{" "}
          {formatNumber(value * price)}
        </p>
      ) : status === "expired" ? (
        <p className="mb-2 text-white">Your checkout session has expired!</p>
      ) : null}
    </div>
  );
}
