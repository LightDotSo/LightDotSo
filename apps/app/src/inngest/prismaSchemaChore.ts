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
      data.forEach(async wallet => {
        prisma.$transaction(async pri => {
          const walletSettings = await pri.walletSettings.findFirst({
            where: {
              walletAddress: wallet.address,
            },
          });

          if (!walletSettings) {
            await pri.walletSettings.create({
              data: {
                walletAddress: wallet.address,
              },
            });
          }
        });
      });

      return data;
    });
  },
);
