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

// From: https://zenn.dev/naporin24690/scraps/1bc717da44e1d6
// Also: https://github.com/napolab/cloudflare-next-image-demo

import { zValidator } from "@hono/zod-validator";
import { createMiddleware } from "hono/factory";
import { createFactory } from "hono/factory";
import { z } from "zod";

export const factory = createFactory();

export const preventResizeLoop = createMiddleware((c, next) => {
  const via = c.req.header("via") ?? "";
  if (/image-resizing/.test(via)) {
    return fetch(c.req.raw);
  }

  return next();
});

const Format = z.union([
  z.literal("avif"),
  z.literal("webp"),
  z.literal("jpeg"),
  z.literal("png"),
]);

export const TransformOptions = z.object({
  blur: z.coerce.number().min(0).max(250).optional(),
  format: Format.optional(),
  height: z.coerce.number().min(0).optional(),
  h: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  w: z.coerce.number().min(0).optional(),
  quality: z.coerce.number().min(0).max(100).optional(),
  q: z.coerce.number().min(0).max(100).optional(),
  url: z.string(),
});

export const transformImageHandler = factory.createHandlers(
  preventResizeLoop,
  zValidator("query", TransformOptions),
  async (c) => {
    const query = c.req.valid("query");
    const accept = c.req.header("accept") ?? "";
    const url = new URL(query.url, c.req.url);

    const res = await fetch(url, {
      cf: {
        image: {
          ...query,
          get quality() {
            return query.quality ?? query.q;
          },
          get width() {
            return query.width ?? query.w;
          },
          get height() {
            return query.height ?? query.h;
          },
          get format() {
            if (query.format !== undefined) {
              return query.format;
            }

            if (/image\/avif/.test(accept)) {
              return "avif";
              // biome-ignore lint/style/noUselessElse: <explanation>
            } else if (/image\/webp/.test(accept)) {
              return "webp";
            }

            return undefined;
          },
        },
      },
    });

    const headers = new Headers(res.headers);

    return c.body(res.body, {
      status: res.status,
      headers,
    });
  },
);
