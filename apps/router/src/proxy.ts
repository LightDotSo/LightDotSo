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
import { Handler } from "hono";
import { StatusCode } from "hono/utils/http-status";

// From: https://github.com/linnil1/hono-cf-proxy/blob/628084ec7a18a964f612559a62651487d81cd2df/src/utils_basic.ts#L3-L41
// License: MIT

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ProxyOptions = {
  // Headers to add to the request
  headers?: Record<string, string>;
};

// -----------------------------------------------------------------------------
// Proxy
// -----------------------------------------------------------------------------

export const basicProxy = (
  proxy_url: string = "",
  options?: ProxyOptions,
): Handler => {
  return async c => {
    // Removes prefix
    // prefix = /app1/*, path = /app1/a/b
    // => suffix_path = /a/b
    // let path = new URL(c.req.raw.url).pathname
    let path = c.req.path;
    path = path.replace(
      new RegExp(`^${c.req.routePath.replace("*", "")}`),
      "/",
    );

    let url = proxy_url ? proxy_url + path : c.req.url;

    // Add params
    if (c.req.query()) {
      url = url + "?" + new URLSearchParams(c.req.query());
    }

    // Add headers
    if (options?.headers) {
      switch (url) {
        case API_URLS.LIFI_API_URL_V1:
          c.req.raw.headers.set("x-lifi-api-key", c.env.LIFI_API_KEY);
          break;
        case API_URLS.SIMPLEHASH_API_URL_V0:
          c.req.raw.headers.set("X-API-KEY", c.env.SIMPLEHASH_API_KEY);
          break;
        case API_URLS.SOCKET_API_URL:
          c.req.raw.headers.set("API-KEY", c.env.SOCKET_API_KEY);
        default:
          break;
      }

      for (const [key, value] of Object.entries(options.headers)) {
        c.req.raw.headers.set(key, value);
      }
    }

    // Return request
    const response = await fetch(url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });

    // Return response
    if (response.status == 101) {
      return response;
    }

    // or Use Hono provided Response class
    return c.newResponse(
      response.body,
      response.status as StatusCode,
      Object.fromEntries(response.headers),
    );
  };
};
