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
import { getLlama } from "@lightdotso/client";
import { NonRetriableError } from "inngest";
import { ChainIds } from "@lightdotso/const";
import { getAddress } from "viem";

export const walletPortfolioSet = inngest.createFunction(
  {
    id: "wallet-portfolio-set",
    debounce: {
      key: "event.data.address",
      period: "30s",
    },
    rateLimit: {
      key: "event.data.address",
      limit: 1,
      period: "1m",
    },
  },
  { event: "wallet/portfolio.set" },
  async ({ event, step, prisma }) => {
    const wallet = await step.run("Find wallet in db", async () => {
      const data = prisma.wallet.findUnique({
        where: {
          address: event.data.address,
        },
      });

      if (!data) {
        throw new NonRetriableError("Wallet not found", {
          cause: new Error("no wallet exists"),
        });
      }

      return data;
    });

    await step.sendEvent("Update the portfolio invoke", {
      name: "wallet/portfolio.update",
      data: {
        address: wallet!.address,
        // Hardcoded service id to respect the `wallet/portfolio.update` event rate limit
        service_id: "get",
      },
    });

    const llama = await step.run("Get llama", async () => {
      const res = await getLlama(wallet!.address);

      return res._unsafeUnwrap();
    });

    const totalNetBalance = await step.run(
      "Calculate total net balance",
      async () => {
        const total = llama.protocols.reduce(
          (prev, curr) =>
            prev +
            curr.balanceUSD -
            (curr.debtUSD || 0) +
            (curr.rewardUSD || 0),
          0,
        );
        return total;
      },
    );

    await step.run(
      "Update the values of the total wallet balance",
      async () => {
        let balances: {
          balanceUSD: number;
          chainId: number;
          amount: bigint;
          price: number;
          symbol?: string;
          name?: string;
          address?: string;
          decimals?: number;
          stable?: boolean;
        }[] = [];

        /// Flat out the llama into a list of balances
        llama.protocols.forEach(protocol => {
          protocol.groups.forEach(group => {
            group.balances.forEach(balance => {
              // Here we add both the balance object and the protocol id to the balances array
              balances.push({
                balanceUSD: balance.balanceUSD,
                chainId: ChainIds[protocol.chain as keyof typeof ChainIds] || 0,
                amount: BigInt(balance.amount),
                price: balance.price,
                symbol: balance.symbol,
                name: balance.name,
                address: getAddress(balance.address),
                decimals: balance.decimals,
                stable: balance.stable,
              });
            });
          });
        });

        // Create tokens if they don't exist
        await prisma.token.createMany({
          data: balances.map(balance => ({
            address: balance.address!,
            chainId: balance.chainId,
            name: balance.name!,
            symbol: balance.symbol!,
            decimals: balance.decimals!,
          })),
          skipDuplicates: true,
        });

        // Get the corresponding tokens
        const tokens = await prisma.token.findMany({
          where: {
            address: {
              in: balances.map(balance => balance.address!),
            },
          },
        });

        // Map the balances to the tokens
        const tokenBalances = balances
          .map(balance => {
            const token = tokens.find(
              token =>
                token.address === balance.address &&
                token.chainId === BigInt(balance.chainId),
            );

            // If the token is not found, return null
            if (!token) {
              return null;
            }

            return {
              ...balance,
              tokenId: token.id,
            };
          })
          // Filter out null values
          .filter(balance => balance !== null)
          // Filter out ones that don't have `address`
          .filter(balance => balance!.address !== undefined);

        // Fetch the latest price for each token
        const latestPrices = await prisma.tokenPrice.findMany({
          where: {
            tokenId: {
              in: tokenBalances.map(balance => balance!.tokenId),
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        });

        // Filter balances to only those with a different price
        const balancesToInsert = tokenBalances.filter(balance => {
          const latestPrice = latestPrices.find(
            price => price.tokenId === balance!.tokenId,
          );

          // If there's no latest price or the price is different, it will be inserted
          return !latestPrice || latestPrice.price !== balance!.price;
        });

        // Create token prices
        await prisma.tokenPrice.createMany({
          data: balancesToInsert.map(balance => ({
            price: balance!.price,
            tokenId: balance!.tokenId,
          })),
          skipDuplicates: true,
        });

        // First, create the portfolio transaction
        await prisma.$transaction([
          prisma.walletBalance.updateMany({
            where: { walletAddress: wallet!.address, chainId: 0 },
            data: { isLatest: false },
          }),
          prisma.walletBalance.create({
            data: {
              walletAddress: wallet!.address,
              chainId: 0,
              balanceUSD: totalNetBalance,
              isLatest: true,
            },
          }),
        ]);

        // Finally, create the balances of the tokens
        await prisma.$transaction([
          prisma.walletBalance.updateMany({
            where: {
              walletAddress: wallet!.address,
              chainId: {
                not: 0,
              },
            },
            data: {
              isLatest: false,
            },
          }),
          prisma.walletBalance.createMany({
            data: tokenBalances.map(balance => ({
              walletAddress: wallet!.address,
              chainId: balance!.chainId,
              balanceUSD: balance!.balanceUSD,
              amount: balance!.amount,
              tokenId: balance!.tokenId,
              stable: balance!.stable,
              isLatest: true,
            })),
          }),
        ]);
      },
    );
  },
);
