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

import {
  type RateLimitBinding,
  WorkersKVStore,
  cloudflareRateLimiter,
} from "@hono-rate-limiter/cloudflare";
import { Context, Hono, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { Page } from "./Page";

type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    RATE_LIMITER: RateLimitBinding;
    ROUTER_RATE_LIMIT: KVNamespace;
  };
};

const app = new Hono<AppType>().get(
  "/",
  (c, next) =>
    cloudflareRateLimiter<AppType>({
      rateLimitBinding: c.env.RATE_LIMITER,
      keyGenerator: c => c.req.header("cf-connecting-ip") ?? "",
      handler: (_, next) => next(),
    })(c, next),
  c => c.html(<Page isSuccessful={c.get("rateLimit")} />),
);

app.use((c: Context, next: Next) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: c => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
    store: new WorkersKVStore({ namespace: c.env.ROUTER_RATE_LIMIT }), // Here CACHE is your WorkersKV Binding.
  })(c, next),
);

export default app;
