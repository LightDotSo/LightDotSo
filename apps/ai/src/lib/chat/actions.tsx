import "server-only";

import { openai } from "@ai-sdk/openai";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";

import {
  BotCard,
  BotMessage,
  Purchase,
  Stock,
  SystemMessage,
  spinner,
} from "@/components/stocks";

// import { auth } from "@/auth";
import { Events } from "@/components/stocks/events";
import { EventsSkeleton } from "@/components/stocks/events-skeleton";
import { SpinnerMessage, UserMessage } from "@/components/stocks/message";
import { StockSkeleton } from "@/components/stocks/stock-skeleton";
import { Stocks } from "@/components/stocks/stocks";
import { StocksSkeleton } from "@/components/stocks/stocks-skeleton";
import type { Chat, Message } from "@/lib/types";
import {
  formatNumber,
  nanoid,
  runAsyncFnWithoutBlocking,
  sleep,
} from "@/lib/utils";
import type { ReactNode } from "react";
import { z } from "zod";

// biome-ignore lint/suspicious/useAwait: <explanation>
async function confirmPurchase(symbol: string, price: number, amount: number) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000);

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>,
    );

    await sleep(1000);

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{" "}
          {formatNumber(amount * price)}
        </p>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={" "}
        {formatNumber(amount * price)}.
      </SystemMessage>,
    );

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: "system",
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`,
        },
      ],
    });
  });

  return {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content,
      },
    ],
  });

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | ReactNode;

  const result = await streamUI({
    model: openai("gpt-3.5-turbo"),
    initial: <SpinnerMessage />,
    system: `\
    You are a stock trading conversation bot and you can help users buy stocks, step by step.
    You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.
    
    Messages inside [] means that it's a UI element or a user event. For example:
    - "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
    - "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.
    
    If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
    If the user just wants the price, call \`show_stock_price\` to show the price.
    If you want to show trending stocks, call \`list_stocks\`.
    If you want to show events, call \`get_events\`.
    If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.
    
    Besides that, you can also chat with users and do some calculations if needed.`,
    messages: [
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
      })),
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue("");
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: "assistant",
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
      listStocks: {
        description: "List three imaginary stocks that are trending.",
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe("The symbol of the stock"),
              price: z.number().describe("The price of the stock"),
              delta: z.number().describe("The change in price of the stock"),
            }),
          ),
        }),
        generate: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          );

          await sleep(1000);

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "assistant",
                content: [
                  {
                    type: "tool-call",
                    toolName: "listStocks",
                    toolCallId,
                    args: { stocks },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "listStocks",
                    toolCallId,
                    result: stocks,
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          );
        },
      },
      showStockPrice: {
        description:
          "Get the current stock price of a given stock or currency. Use this to show the price to the user.",
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              "The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.",
            ),
          price: z.number().describe("The price of the stock."),
          delta: z.number().describe("The change in price of the stock"),
        }),
        generate: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          );

          await sleep(1000);

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "assistant",
                content: [
                  {
                    type: "tool-call",
                    toolName: "showStockPrice",
                    toolCallId,
                    args: { symbol, price, delta },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "showStockPrice",
                    toolCallId,
                    result: { symbol, price, delta },
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          );
        },
      },
      showStockPurchase: {
        description:
          "Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.",
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              "The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.",
            ),
          price: z.number().describe("The price of the stock."),
          numberOfShares: z
            .number()
            .describe(
              "The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.",
            ),
        }),
        // biome-ignore lint/suspicious/useAwait: <explanation>
        // biome-ignore lint/correctness/useYield: <explanation>
        generate: async function* ({ symbol, price, numberOfShares = 100 }) {
          const toolCallId = nanoid();

          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: "assistant",
                  content: [
                    {
                      type: "tool-call",
                      toolName: "showStockPurchase",
                      toolCallId,
                      args: { symbol, price, numberOfShares },
                    },
                  ],
                },
                {
                  id: nanoid(),
                  role: "tool",
                  content: [
                    {
                      type: "tool-result",
                      toolName: "showStockPurchase",
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares,
                        status: "expired",
                      },
                    },
                  ],
                },
                {
                  id: nanoid(),
                  role: "system",
                  content: "[User has selected an invalid amount]",
                },
              ],
            });

            return <BotMessage content={"Invalid amount"} />;
          }
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "assistant",
                content: [
                  {
                    type: "tool-call",
                    toolName: "showStockPurchase",
                    toolCallId,
                    args: { symbol, price, numberOfShares },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "showStockPurchase",
                    toolCallId,
                    result: {
                      symbol,
                      price,
                      numberOfShares,
                    },
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <Purchase
                props={{
                  numberOfShares,
                  symbol,
                  price: +price,
                  status: "requires_action",
                }}
              />
            </BotCard>
          );
        },
      },
      getEvents: {
        description:
          "List funny imaginary events between user highlighted dates that describe stock activity.",
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe("The date of the event, in ISO-8601 format"),
              headline: z.string().describe("The headline of the event"),
              description: z.string().describe("The description of the event"),
            }),
          ),
        }),
        generate: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          );

          await sleep(1000);

          const toolCallId = nanoid();

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "assistant",
                content: [
                  {
                    type: "tool-call",
                    toolName: "getEvents",
                    toolCallId,
                    args: { events },
                  },
                ],
              },
              {
                id: nanoid(),
                role: "tool",
                content: [
                  {
                    type: "tool-result",
                    toolName: "getEvents",
                    toolCallId,
                    result: events,
                  },
                ],
              },
            ],
          });

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          );
        },
      },
    },
  });

  return {
    id: nanoid(),
    display: result.value,
  };
}

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIState = {
  chatId: string;
  messages: Message[];
};

// biome-ignore lint/style/useNamingConvention: <explanation>
export type UIState = {
  id: string;
  display: ReactNode;
}[];

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase,
  },
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialUIState: [],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialAIState: { chatId: nanoid(), messages: [] },
  // biome-ignore lint/style/useNamingConvention: <explanation>
  // biome-ignore lint/suspicious/useAwait: <explanation>
  onGetUIState: async () => {
    // "use server";

    // if (session?.user) {
    //   const aiState = getAIState();

    //   if (aiState) {
    //     const uiState = getUIStateFromAIState(aiState);
    //     return uiState;
    //   }
    // } else {
    //   return;
    // }
    return;
  },
  // biome-ignore lint/style/useNamingConvention: <explanation>
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  // biome-ignore lint/suspicious/useAwait: <explanation>
  onSetAIState: async ({ state }) => {
    // "use server";
    // const session = await auth();
    // if (session?.user) {
    //   const { chatId, messages } = state;
    //   const createdAt = new Date();
    //   const userId = session.user.id as string;
    //   const path = `/chat/${chatId}`;
    //   const firstMessageContent = messages[0].content as string;
    //   const title = firstMessageContent.substring(0, 100);
    //   const chat: Chat = {
    //     id: chatId,
    //     title,
    //     userId,
    //     createdAt,
    //     messages,
    //     path,
    //   };
    //   await saveChat(chat);
    // } else {
    //   return;
    // }

    return;
  },
});

// biome-ignore lint/style/useNamingConvention: <explanation>
export const getUIStateFromAIState = (aiState: Chat) => {
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
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === "showStockPrice" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === "showStockPurchase" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === "getEvents" ? (
              // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
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
