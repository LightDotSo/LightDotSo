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
import { WalletBalanceCategory } from "@lightdotso/prisma";
import { NonRetriableError } from "inngest";

export const walletPortfolio = inngest.createFunction(
  {
    id: "wallet-portfolio",
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
  { event: "wallet/portfolio" },
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
        return await prisma.walletBalance.createMany({
          data: [
            {
              walletAddress: wallet!.address,
              chainId: 0,
              balance: totalNetBalance,
              category: WalletBalanceCategory.BALANCE,
            },
          ],
        });
      },
    );
  },
);
