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
  cloudflareRateLimiter,
} from "@hono-rate-limiter/cloudflare";
import { Hono } from "hono";
import { Page } from "./Page";

type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    RATE_LIMITER: RateLimitBinding;
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

export default app;
