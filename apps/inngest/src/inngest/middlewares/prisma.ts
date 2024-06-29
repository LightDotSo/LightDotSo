// Copyright 2023-2024 Light.
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

import { prisma } from "@lightdotso/prisma";
import { InngestMiddleware } from "inngest";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export const prismaMiddleware = new InngestMiddleware({
  name: "Prisma Middleware",
  init: function () {
    return {
      onFunctionRun: function (_ctx) {
        return {
          transformInput: function (_ctx) {
            return {
              // Anything passed via `ctx` will be merged with the function's arguments
              ctx: {
                prisma: prisma,
              },
            };
          },
        };
      },
    };
  },
});
