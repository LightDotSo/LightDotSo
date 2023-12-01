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

import { NonRetriableError } from "inngest";
import {
  COVALENT_CHAIN_ID_MAPPING,
  COVALENT_MAINNET_CHAIN_ID_MAPPING,
} from "@/const/covalent";
import { inngest } from "@/inngest/client";

// -----------------------------------------------------------------------------
// Inngest
// -----------------------------------------------------------------------------

export const walletPortfolioInvoke = inngest.createFunction(
  {
    id: "wallet-portfolio-invoke",
    rateLimit: {
      key: "event.data.address",
      limit: 1,
      period: "3m",
    },
  },
  { event: "wallet/portfolio.invoke" },
  async ({ event, step, prisma }) => {
    const wallet = await step.run("Find wallet in db", async () => {
      const data = prisma.wallet.findUnique({
        where: {
          address: event.data.address,
        },
        include: {
          walletSettings: true,
        },
      });

      if (!data) {
        throw new NonRetriableError("Wallet not found", {
          cause: new Error("no wallet exists"),
        });
      }

      return data;
    });

    // For each chainId in the `ChainIdMapping`, send an `wallet/transaction.covalent.set` event.
    // with the array of chainIds.
    // If the wallet settings has `isEnabledTestnet` set to true, then use the `ChainIdTestnetMapping` instead.
    const chainIds = Object.keys(
      wallet?.walletSettings?.isEnabledTestnet
        ? COVALENT_CHAIN_ID_MAPPING
        : COVALENT_MAINNET_CHAIN_ID_MAPPING,
    ).map(chainId => {
      return parseInt(chainId);
    });

    await step.sendEvent("Set the portfolio", {
      name: "wallet/portfolio.covalent.set",
      data: {
        address: wallet!.address,
        chainIds,
      },
    });
  },
);
