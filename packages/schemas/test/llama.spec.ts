// Copyright 2023-2024 Light
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { test, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { llamaGetSchema } from "../src";
import data from "./mocks/llama.json";

test("llamaGetSchema", async () => {
  const parsed = llamaGetSchema.parse(data);

  // Recursively get all balances w/ the id: wallet

  let balances: {
    balanceUSD: number;
    chainId: number;
    amount: BigInt;
    price: number;
    symbol?: string;
    name?: string;
    address?: string;
    decimals?: number;
  }[] = [];

  parsed.protocols.forEach(protocol => {
    protocol.groups.forEach(group => {
      group.balances.forEach(balance => {
        // Here we add both the balance object and the protocol id to the balances array
        balances.push({
          balanceUSD: balance.balanceUSD,
          chainId: 0,
          amount: BigInt(balance.amount),
          price: balance.price,
          symbol: balance.symbol,
          name: balance.name,
          address: balance.address,
          decimals: balance.decimals,
        });
      });
    });
  });

  console.info(balances);
});
