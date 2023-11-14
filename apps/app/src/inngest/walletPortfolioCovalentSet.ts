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
import { getAddress } from "viem";

export const walletPortfolioCovalentSet = inngest.createFunction(
  {
    id: "wallet-portfolio-covalent-set",
    concurrency: {
      limit: 4,
    },
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
        const portfolioItems = portfolio.data.items.map(item => {
          // Replace the addresses of `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` with `0x0000000000000000000000000000000000000000`
          // This is because Covalent uses the former for ETH, but we use the latter.
          if (
            item.contract_address ===
              "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
            item.contract_address ===
              "0x0000000000000000000000000000000000001010"
          ) {
            item.contract_address =
              "0x0000000000000000000000000000000000000000";
          }
          return item;
        });
        const chainId = portfolio.data.chain_id;

        // Create tokens if they don't exist
        await prisma.token.createMany({
          data: portfolioItems.map(balance => ({
            address: getAddress(balance.contract_address),
            chainId: chainId,
            name: balance.contract_name,
            symbol: balance.contract_ticker_symbol,
            decimals: balance.contract_decimals,
          })),
          skipDuplicates: true,
        });

        // Get the token ids
        const tokens = await prisma.token.findMany({
          where: {
            chainId: chainId,
          },
        });

        // First, filter out portfolio items that have associated tokens.
        const validItems = portfolioItems.filter(balance =>
          tokens.some(
            token => token.address === getAddress(balance.contract_address),
          ),
        );

        // Next, map over those valid items.
        const tokenBalances = validItems.map(balance => {
          const token = tokens.find(
            token => token.address === getAddress(balance.contract_address),
          );

          return {
            ...balance,
            tokenId: token!.id, // This will not fail as we already filtered out items without tokens.
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
