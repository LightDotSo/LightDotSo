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
      period: "3m",
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
              });
            });
          });
        });

        // Create ERC20 tokens if they don't exist
        await prisma.eRC20.createMany({
          data: [
            ...balances.map(balance => ({
              address: balance.address!,
              chainId: balance.chainId,
              name: balance.name,
              symbol: balance.symbol!,
              decimals: balance.decimals!,
            })),
          ],
          skipDuplicates: true,
        });

        // Get the corresponding ERC20 tokens
        const erc20Tokens = await prisma.eRC20.findMany({
          where: {
            address: {
              in: balances.map(balance => balance.address!),
            },
          },
        });

        // Map the balances to the ERC20 tokens
        balances = balances.map(balance => {
          const token = erc20Tokens.find(
            token => token.address === balance.address,
          );

          return {
            ...balance,
            erc20Id: token!.id,
          };
        });

        return await prisma.walletBalance.createMany({
          data: [
            {
              walletAddress: wallet!.address,
              chainId: 0,
              balanceUSD: totalNetBalance,
            },
            ...balances.map(balance => ({
              walletAddress: wallet!.address,
              chainId: balance.chainId,
              balanceUSD: balance.balanceUSD,
              amount: balance.amount,
              price: balance.price,
              erc20Id: balance.erc20Id,
            })),
          ],
        });
      },
    );
  },
);
