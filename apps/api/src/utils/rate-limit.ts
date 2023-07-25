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

// From: https://github.com/OrJDev/trpc-limiter/blob/a4b6c38c9a3a04f042dd5a7b7b20af710ec4801f/packages/upstash/src/index.ts
import { defineTRPCLimiter } from "@trpc-limiter/core";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const createTRPCUpstashLimiter = defineTRPCLimiter({
  store: opts =>
    new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(opts.max, `${opts.windowMs} ms`),
    }),
  async isBlocked(store, fingerprint) {
    const { success, pending, ...rest } = await store.limit(fingerprint);
    await pending;
    return success ? null : rest;
  },
});
