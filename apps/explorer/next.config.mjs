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

import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import packageJson from "./package.json" assert { type: "json" };

// -----------------------------------------------------------------------------
// Next Config
// -----------------------------------------------------------------------------

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath:
    process.env.VERCEL_GIT_COMMIT_REF === "changeset-release/main"
      ? "/explorer"
      : "/",
  env: {
    NEXT_PUBLIC_APP_VERSION: `@lightdotso/explorer@${packageJson.version}`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: true,
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
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  outputFileTracing: true,
  transpilePackages: [
    "@lightdotso/client",
    "@lightdotso/data",
    "@lightdotso/hooks",
    "@lightdotso/kysely",
    "@lightdotso/nuqs",
    "@lightdotso/params",
    "@lightdotso/prisma",
    "@lightdotso/query",
    "@lightdotso/query-keys",
    "@lightdotso/services",
    "@lightdotso/stores",
    "@lightdotso/styles",
    "@lightdotso/svg",
    "@lightdotso/tables",
    "@lightdotso/types",
    "@lightdotso/ui",
    "@lightdotso/utils",
  ],
  webpack: config => {
    config.externals.push("async_hooks", "pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };

    return config;
  },
};

// -----------------------------------------------------------------------------
// Sentry Config
// -----------------------------------------------------------------------------

const sentryWebpackPluginOptions = {
  silent: false,
};

// -----------------------------------------------------------------------------
// Plugins
// -----------------------------------------------------------------------------

const plugins = [
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
  }),
  withSentryConfig,
];

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default plugins.reduce((acc, next) => {
  if (next.name === "withSentryConfig") {
    return next(acc, sentryWebpackPluginOptions);
  }

  return next(acc);
}, nextConfig);
