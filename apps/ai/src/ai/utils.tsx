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

import "server-only";
import { BotCard, BotMessage, Purchase, Stock } from "@/components/stocks";
import { Events } from "@/components/stocks/events";
import type { Event as EventType } from "@/components/stocks/events";
import { UserMessage } from "@/components/stocks/message";
import type { Purchase as PurchaseType } from "@/components/stocks/stock-purchase";
import { type Stock as StockType, Stocks } from "@/components/stocks/stocks";
import type { AIState } from "./client";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export const getUIStateFromAIState = (aiState: AIState) => {
  return aiState.messages
    .filter((message) => message.role !== "system")
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === "tool" ? (
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
          message.content.map((tool) => {
            return tool.toolName === "listStocks" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                <Stocks props={tool.result as StockType[]} />
              </BotCard>
            ) : tool.toolName === "showStockPrice" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                <Stock props={tool.result as StockType} />
              </BotCard>
            ) : tool.toolName === "showStockPurchase" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                <Purchase props={tool.result as PurchaseType} />
              </BotCard>
            ) : tool.toolName === "getEvents" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                <Events props={tool.result as EventType[]} />
              </BotCard>
            ) : null;
          })
        ) : message.role === "user" ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === "assistant" &&
          typeof message.content === "string" ? (
          <BotMessage content={message.content} />
        ) : null,
    }));
};
