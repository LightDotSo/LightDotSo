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

import type { GetEvents } from "inngest";

import { inngest } from "./client";
type Events = GetEvents<typeof inngest>;

export const walletPortfolioCron = inngest.createFunction(
  { id: "daily-wallet-portfolio-cron" },
  { cron: "0 0 * * *" },
  async ({ prisma, step }) => {
    // Fetch all users
    const wallets = await step.run("Find wallets in db", async () => {
      const data = prisma.wallet.findMany({});

      return data;
    });

    // For each user, send us an event.  Inngest supports batches of events
    // as long as the entire payload is less than 512KB.
    const events = wallets.map<Events["wallet/portfolio.set"]>(wallet => {
      return {
        name: "wallet/portfolio.set",
        data: {
          ...wallet,
        },
        wallet,
      };
    });

    // Send all events to Inngest, which triggers any functions listening to
    // the given event names.
    await step.sendEvent("fan-out-daily-wallet-portfolio", events);

    // Return the number of users triggered.
    return { count: wallets.length };
  },
);
