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

import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "@/server/context";
import type { AnyRouter } from "@trpc/server";

// From: https://trpc.io/docs/server/caching
export const nextHandler = (handler: AnyRouter) =>
  trpcNext.createNextApiHandler({
    router: handler,
    createContext,
    responseMeta(opts) {
      const { ctx, paths, errors, type } = opts;
      // assuming you have all your public routes with the keyword `public` in them
      const allPublic = paths && paths.every(path => path.includes("public"));
      // checking that no procedures errored
      const allOk = errors.length === 0;
      // checking we're doing a query request
      const isQuery = type === "query";

      if (ctx?.res && allPublic && allOk && isQuery) {
        // cache request for 1 day + revalidate once every second
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        return {
          headers: {
            "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
          },
        };
      }
      return {};
    },
  });
