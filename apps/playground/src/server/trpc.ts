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

import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(opts => {
  const { session } = opts.ctx;

  if (!session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return opts.next({ ctx: { session } });
});

export const createAction = experimental_createServerActionHandler({
  rootConfig: t,
  async createContext() {
    const session = await auth();

    return {
      session,
      headers: {
        // Pass the cookie header to the API
        cookies: headers().get("cookie") ?? "",
      },
    };
  },
});
