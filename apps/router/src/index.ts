// Copyright 2023-2024 LightDotSo.
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

import { API_URLS } from "@lightdotso/const";
import {
  type RateLimitBinding,
  cloudflareRateLimiter,
} from "@hono-rate-limiter/cloudflare";
import { Hono } from "hono";
import { basicProxy } from "./proxy";

// -----------------------------------------------------------------------------
// Hono App Types
// -----------------------------------------------------------------------------

type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    // Secrets
    LIFI_API_KEY: string;
    SIMPLEHASH_API_KEY: string;
    SOCKET_API_KEY: string;
    // Rate Limiters
    RATE_LIMITER: RateLimitBinding;
    ROUTER_RATE_LIMIT: KVNamespace;
  };
};

// -----------------------------------------------------------------------------
// App
// -----------------------------------------------------------------------------

const app = new Hono<AppType>();

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

app.get(
  "/",
  (c, next) =>
    cloudflareRateLimiter<AppType>({
      rateLimitBinding: c.env.RATE_LIMITER,
      keyGenerator: c => c.req.header("cf-connecting-ip") ?? "",
      handler: (_, next) => next(),
    })(c, next),
  c => c.json({ message: `router.light.so rateLimit: ${c.get("rateLimit")}` }),
);

app.all("/lifi/*", basicProxy(API_URLS.LIFI_API_URL));
app.all("/simplehash/v0/*", basicProxy(API_URLS.SIMPLEHASH_API_URL_V0));
app.all("/socket/*", basicProxy(API_URLS.SOCKET_API_URL));

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default app;
