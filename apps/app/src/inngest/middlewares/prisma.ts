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

import { PrismaClient } from "@lightdotso/prisma";
import { InngestMiddleware } from "inngest";

export const prismaMiddleware = new InngestMiddleware({
  name: "Prisma Middleware",
  init() {
    const prisma = new PrismaClient();

    return {
      onFunctionRun(_ctx) {
        return {
          transformInput(_ctx) {
            return {
              // Anything passed via `ctx` will be merged with the function's arguments
              ctx: {
                prisma,
              },
            };
          },
        };
      },
    };
  },
});
