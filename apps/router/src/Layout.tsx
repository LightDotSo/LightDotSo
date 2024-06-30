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

import { Style, css } from "hono/css";
import type { FC, PropsWithChildren } from "hono/jsx";

const globalClasses = css`
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings: "slnt" 0;
  background: linear-gradient(
    to bottom,
    rgb(214, 219, 220),
    rgb(255, 255, 255)
  );
  margin: 0;
  @media (prefers-color-scheme: dark) {
    background: #000;
  }
`;

const mainClass = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1024;
  margin: 0 auto;
  flex-direction: column;
  height: 79vh;
  padding: 3rem;
  @media screen and (min-width: 1024px) {
    padding: 6rem;
  }
`;

export const Layout: FC<PropsWithChildren> = (props: PropsWithChildren) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <title>Hono Rate Limiter + Cloudflare</title>
        <meta
          name="description"
          content="Rate limiting middleware for Honojs. Use to limit repeated requests to public APIs and/or endpoints such as password reset."
        />
        <meta name="author" content="Rhinobase Team" />
        <meta
          name="keywords"
          content="hono,api,middleware,rest-api,cloudflare,rate-limiting,rate-limiter,honojs"
        />
        <meta name="category" content="technology" />
        <meta property="og:title" content="Hono Rate Limiter + Cloudflare" />
        <meta
          property="og:description"
          content="Rate limiting middleware for Honojs."
        />
        <meta property="og:url" content="https://" />
        <meta property="og:site_name" content="hono-rate-limiter-demo" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image"
          content="https://hono-rate-limiter.vercel.app/cover.png"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@rhinobaseio" />
        <meta name="twitter:title" content="Hono Rate Limiter + Cloudflare" />
        <meta
          name="twitter:description"
          content="Rate limiting middleware for Honojs."
        />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <meta
          name="twitter:image"
          content="https://hono-rate-limiter.vercel.app/cover.png"
        />
        <meta name="theme-color" content="#09090b" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://hono-rate-limiter.vercel.app/favicon.ico"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <Style />
      </head>
      <body class={globalClasses}>
        <main class={mainClass}>{props.children}</main>
      </body>
    </html>
  );
};
