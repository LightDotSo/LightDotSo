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
import { NonRetriableError } from "inngest";

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
  async ({ event, step, prisma }) => {
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
        const chainId = portfolio.data.chain_id;

        // For loop for each token
        for (const token of portfolio.data.items) {
          // Get the token balance
          console.info(token);
        }

        // Create tokens if they don't exist
        await prisma.token.createMany({
          data: portfolio.data.items.map(balance => ({
            address: balance.contract_address,
            chainId: chainId,
            name: balance.contract_name,
            symbol: balance.contract_ticker_symbol,
            decimals: balance.contract_decimals,
          })),
          skipDuplicates: true,
        });

        // Get the token ids
        const tokenIds = await prisma.token.findMany({
          where: {
            address: {
              in: portfolio.data.items.map(balance => balance.contract_address),
            },
          },
          select: {
            id: true,
            address: true,
          },
        });

        // Map the token ids to the token balances
        const tokenBalances = portfolio.data.items.map(balance => {
          const tokenId = tokenIds.find(
            token => token.address === balance.contract_address,
          )?.id;

          return {
            ...balance,
            tokenId: tokenId!,
          };
        });

        // Create token prices
        await prisma.tokenPrice.createMany({
          data: tokenBalances.map(balance => ({
            price: balance.quote_rate,
            tokenId: balance.tokenId,
          })),
        });

        // Finally, create the balances of the tokens
        await prisma.$transaction([
          prisma.walletBalance.updateMany({
            where: {
              walletAddress: event.data.address,
              chainId: chainId,
            },
            data: {
              isLatest: false,
            },
          }),
          prisma.walletBalance.createMany({
            data: tokenBalances.map(balance => ({
              walletAddress: event.data.address,
              chainId: chainId,
              balanceUSD: balance.quote,
              amount: balance.balance,
              tokenId: balance.tokenId,
              stable: balance.type === "stablecoin",
              isLatest: true,
            })),
          }),
        ]);
      }
    });

    await step.run("Calculate the total balance", async () => {
      // Get the total balance from the `isLatest` balances
      const totalNetBalance = await prisma.walletBalance.aggregate({
        where: {
          walletAddress: event.data.address,
          isLatest: true,
        },
        _sum: {
          balanceUSD: true,
        },
      });

      if (!totalNetBalance._sum.balanceUSD) {
        throw new NonRetriableError("Sum not found", {
          cause: new Error("no sum computed"),
        });
      }

      // First, create the portfolio transaction
      await prisma.$transaction([
        prisma.walletBalance.updateMany({
          where: { walletAddress: event.data.address, chainId: 0 },
          data: { isLatest: false },
        }),
        prisma.walletBalance.create({
          data: {
            walletAddress: event.data.address,
            chainId: 0,
            balanceUSD: totalNetBalance._sum.balanceUSD,
            isLatest: true,
          },
        }),
      ]);
    });
  },
);
