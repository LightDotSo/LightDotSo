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

import { withSentryConfig } from "@sentry/nextjs";

const sentryWebpackPluginOptions = {
  silent: false,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    // From: https://github.com/vercel/next.js/issues/42641
    outputFileTracingExcludes: {
      "*": [
        "./node_modules/@swc/core-linux-x64-gnu",
        "./node_modules/@swc/core-linux-x64-musl",
        "./node_modules/esbuild-linux-64/bin",
        "./node_modules/webpack/lib",
        "./node_modules/rollup",
        "./node_modules/terser",
      ],
    },
    serverActions: true,
  },
  outputFileTracing: true,
  transpilePackages: ["@lightdotso/trpc", "@lightdotso/ui"],
  webpack: config => {
    config.externals.push("async_hooks", "pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };

    if (config.isServer) {
      // eslint-disable-next-line no-undef
      config.resolve.alias["@sentry/nextjs"] = require.resolve(
        "@sentry/nextjs/cjs/edge",
      );
    }

    return config;
  },
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
