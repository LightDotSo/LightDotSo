// Copyright 2023-2024 Light, Inc.
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

import { inngest } from "@/inngest/client";

// -----------------------------------------------------------------------------
// Inngest
// -----------------------------------------------------------------------------

export const portfolioKafkaCron = inngest.createFunction(
  {
    id: "portfolio-kafka-cron",
  },
  {
    cron: "0 0 * * *",
    // @ts-expect-error
    event: "portfolio/kafka.cron",
  },
  async ({ step, prisma }) => {
    await step.run("Crons to run", async () => {
      const [
        totalBalance,
        totalTransactions,
        totalUserOperations,
        totalWallets,
      ] = await Promise.all([
        prisma.walletBalance.aggregate({
          _sum: {
            balanceUSD: true,
          },
          where: {
            chainId: 0,
          },
        }),
        prisma.transaction.aggregate({
          _count: true,
        }),
        prisma.userOperation.aggregate({
          _count: true,
        }),
        prisma.wallet.aggregate({
          _count: true,
        }),
      ]);

      if (!totalBalance._sum.balanceUSD) {
        return;
      }

      const data = await prisma.metrics.create({
        data: {
          balanceUSDSum: totalBalance._sum.balanceUSD,
          transactionCount: totalTransactions._count,
          userOperationCount: totalUserOperations._count,
          walletCount: totalWallets._count,
        },
      });

      // For each wallet, add an empty wallet settings record if one does not exist
      // data.forEach(async wallet => {
      //   portfolio.$transaction(async pri => {
      //     const walletSettings = await pri.walletSettings.findFirst({
      //       where: {
      //         walletAddress: wallet.address,
      //       },
      //     });

      //     if (!walletSettings) {
      //       await pri.walletSettings.create({
      //         data: {
      //           walletAddress: wallet.address,
      //         },
      //       });
      //     }
      //   });
      // });

      // const data = await portfolio.transaction.findMany();

      // // Insert the data in _TransactionToWallet table using raw SQL
      // for (let transaction of data) {
      //   const { hash } = transaction;

      //   if (!hash) {
      //     continue;
      //   }

      //   // await portfolio.$executeRaw`INSERT INTO _TransactionToWallet (A, B) VALUES (${hash}, ${walletAddress})`;
      // }

      return data;
    });
  },
);
