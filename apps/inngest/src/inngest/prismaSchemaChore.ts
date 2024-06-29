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

import { inngest } from "@/inngest/client";

// -----------------------------------------------------------------------------
// Inngest
// -----------------------------------------------------------------------------

export const prismaSchemaChore = inngest.createFunction(
  {
    id: "prisma-schema-chore",
  },
  { event: "prisma/schema.chore" },
  async ({ step, prisma }) => {
    await step.run("Chores to run", async () => {
      const data = await prisma.wallet.findMany();

      // For each wallet, add an empty wallet settings record if one does not exist
      // data.forEach(async wallet => {
      //   prisma.$transaction(async pri => {
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

      // const data = await prisma.transaction.findMany();

      // // Insert the data in _TransactionToWallet table using raw SQL
      // for (let transaction of data) {
      //   const { hash } = transaction;

      //   if (!hash) {
      //     continue;
      //   }

      //   // await prisma.$executeRaw`INSERT INTO _TransactionToWallet (A, B) VALUES (${hash}, ${walletAddress})`;
      // }

      return data;
    });
  },
);
