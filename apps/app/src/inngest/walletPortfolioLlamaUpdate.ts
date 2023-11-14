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
import { postLlama } from "@lightdotso/client";
import { NonRetriableError } from "inngest";

export const walletPortfolioLlamaUpdate = inngest.createFunction(
  {
    id: "wallet-portfolio-llama-update",
    rateLimit: {
      key: `event.data.address + "-" + event.data.service_id`,
      limit: 1,
      period: "24h",
    },
  },
  { event: "wallet/portfolio.llama.update" },
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

    await step.run("Update llama", async () => {
      const res = await postLlama(wallet!.address);

      return res._unsafeUnwrap();
    });
  },
);
