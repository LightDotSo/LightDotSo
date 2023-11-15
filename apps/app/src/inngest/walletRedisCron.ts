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

import { redis } from "@/clients/redis";
import { inngest } from "./client";

export const walletRedisCron = inngest.createFunction(
  { id: "daily-wallet-redis-cron" },
  { cron: "0 0 * * *" },
  async ({ prisma, step }) => {
    // Fetch all users
    const wallets = await step.run("Find wallets in db", async () => {
      const data = prisma.wallet.findMany({});

      return data;
    });

    // For each wallet, add to `wallet` set
    await step.run("Add wallets to Redis", async () => {
      let pipe = redis.pipeline();

      // Add the commands to the pipeline
      for (let wallet of wallets) {
        pipe.sadd("wallets", wallet.address);
      }

      // Execute the pipeline
      const data = await pipe.exec();
      return data;
    });
  },
);
