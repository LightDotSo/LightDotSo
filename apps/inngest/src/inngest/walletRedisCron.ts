// Copyright 2023-2024 Light
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { redis } from "@lightdotso/redis";
import { inngest } from "@/inngest/client";

// -----------------------------------------------------------------------------
// Inngest
// -----------------------------------------------------------------------------

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
