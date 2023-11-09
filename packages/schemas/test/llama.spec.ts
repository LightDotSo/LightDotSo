// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
