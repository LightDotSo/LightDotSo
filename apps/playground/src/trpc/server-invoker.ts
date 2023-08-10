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

"use server";

import { loggerLink } from "@trpc/client";
import { experimental_nextCacheLink } from "@trpc/next/app-dir/links/nextCache";
import {
  experimental_createServerActionHandler,
  experimental_createTRPCNextAppDirServer,
} from "@trpc/next/app-dir/server";
import { auth } from "@/auth";
import { appRouter } from "@/server/routers/_app";
import { cookies } from "next/headers";
import superjson from "superjson";

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
export const api = experimental_createTRPCNextAppDirServer<typeof appRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
          enabled: op => true,
        }),
        experimental_nextCacheLink({
          // requests are cached for 5 seconds
          revalidate: 5,
          router: appRouter,
          async createContext() {
            return {
              session: await auth(),
              headers: {
                cookie: cookies().toString(),
                "x-trpc-source": "rsc-invoke",
              },
            };
          },
        }),
      ],
    };
  },
});

export const createAction = experimental_createServerActionHandler({
  router: appRouter,
  async createContext() {
    return {
      session: await auth(),
      headers: {
        cookie: cookies().toString(),
        "x-trpc-source": "server-action",
      },
    };
  },
});
