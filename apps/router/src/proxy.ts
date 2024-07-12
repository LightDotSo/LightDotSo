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
import { THE_GRAPH_SUBGRAPH_IDS } from "@lightdotso/const/src/api_urls";
import { Handler } from "hono";
import { StatusCode } from "hono/utils/http-status";

// From: https://github.com/linnil1/hono-cf-proxy/blob/628084ec7a18a964f612559a62651487d81cd2df/src/utils_basic.ts#L3-L41
// License: MIT

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ProxyOptions = {
  // Graph URL ID to proxy
  the_graph?: keyof typeof THE_GRAPH_SUBGRAPH_IDS;
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
    // let path = new URL(url).pathname
    let path = c.req.path;
    path = path.replace(
      new RegExp(`^${c.req.routePath.replace("*", "")}`),
      "/",
    );

    let url = proxy_url ? proxy_url + path : c.req.url;

    // If the_graph is provided, construct the URL
    if (options?.the_graph && proxy_url == API_URLS.THE_GRAPH_API_URL) {
      url = `${API_URLS.THE_GRAPH_API_URL}/${c.env.THE_GRAPH_API_KEY}/subgraphs/id/${THE_GRAPH_SUBGRAPH_IDS[options.the_graph]}`;
    }

    // Add params
    if (c.req.query()) {
      url = url + "?" + new URLSearchParams(c.req.query());
    }

    // Initialize Headers
    let headers = new Headers();

    headers.set("Content-Type", "application/json");
    // Automatically add API keys to headers
    switch (proxy_url) {
      case API_URLS.LIFI_API_URL_V1:
        headers.set("x-lifi-api-key", c.env.LIFI_API_KEY);
        break;
      case API_URLS.SIMPLEHASH_API_URL_V0:
        headers.set("X-API-KEY", c.env.SIMPLEHASH_API_KEY);
        break;
      case API_URLS.SOCKET_API_URL:
        headers.set("API-KEY", c.env.SOCKET_API_KEY);
      default:
        break;
    }

    // Add headers if provided
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }

    // Return request
    const response = await fetch(url, {
      method: c.req.method,
      headers: headers,
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
