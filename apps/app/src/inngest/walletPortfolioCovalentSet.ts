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

import { inngest } from "@/inngest/client";
import type { Chain } from "@covalenthq/client-sdk";
import { CovalentClient } from "@covalenthq/client-sdk";
import { ChainIdMapping } from "./walletPortfolioInvoke";

export const walletPortfolioCovalentSet = inngest.createFunction(
  {
    id: "wallet-portfolio-covalent-set",
    debounce: {
      key: "event.data.address",
      period: "3s",
    },
    rateLimit: {
      key: "event.data.address",
      limit: 1,
      period: "1m",
    },
  },
  { event: "wallet/portfolio.covalent.set" },
  async ({ event, step, _prisma }) => {
    await step.run("Get Covalent", async () => {
      // Parse the chain names from the array of chainIds (e.g. [1, 137] => ["eth-mainnet", "matic-mainnet"])
      const chains = event.data.chainIds.map(chainId => {
        return ChainIdMapping[chainId] as Chain;
      });

      // Get the Covalent client for the given chain.
      const client = new CovalentClient(process.env.COVALENT_API_KEY!);

      // For each chain, loop through the wallets and get the portfolio.
      for (const chain of chains) {
        // Get the portfolio for the given chain.
        const portfolio =
          await client.BalanceService.getTokenBalancesForWalletAddress(
            chain,
            event.data.address,
          );

        // Log the portfolio for now
        console.info(portfolio);
      }
    });
  },
);
