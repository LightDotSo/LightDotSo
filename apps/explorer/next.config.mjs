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
      : "",
  env: {
    NEXT_PUBLIC_APP_VERSION: `@lightdotso/explorer@${packageJson.version}`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
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
