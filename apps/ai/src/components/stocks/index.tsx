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

import dynamic from "next/dynamic";
import { EventsSkeleton } from "./events-skeleton";
import { StockSkeleton } from "./stock-skeleton";
import { StocksSkeleton } from "./stocks-skeleton";

export { spinner } from "./spinner";
export { BotCard, BotMessage, SystemMessage } from "./message";

const Stock = dynamic(() => import("./stock").then((mod) => mod.Stock), {
  ssr: false,
  loading: () => <StockSkeleton />,
});

const Purchase = dynamic(
  () => import("./stock-purchase").then((mod) => mod.Purchase),
  {
    ssr: false,
    loading: () => (
      <div className="h-[375px] rounded-xl border bg-zinc-950 p-4 text-green-400 sm:h-[314px]" />
    ),
  },
);

const Stocks = dynamic(() => import("./stocks").then((mod) => mod.Stocks), {
  ssr: false,
  loading: () => <StocksSkeleton />,
});

const Events = dynamic(() => import("./events").then((mod) => mod.Events), {
  ssr: false,
  loading: () => <EventsSkeleton />,
});

export { Stock, Purchase, Stocks, Events };
