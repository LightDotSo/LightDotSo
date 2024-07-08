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

import withBundleAnalyzer from "@next/bundle-analyzer";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { withSentryConfig } from "@sentry/nextjs";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import withSerwistInit from "@serwist/next";
import packageJson from "./package.json" assert { type: "json" };

// -----------------------------------------------------------------------------
// Path Config
// -----------------------------------------------------------------------------

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Next Config
// ---------------------------------------------------------------------------

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: `@lightdotso/app@${packageJson.version}`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: "incremental",
    // esmExternals: "loose",
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
  rewrites: async () => {
    return [
      {
        source: "/blog",
        destination: "https://blog.light.so/blog",
      },
      {
        source: "/blog/:path*",
        destination: "https://blog.light.so/blog/:path*",
      },
      {
        source: "/changelog",
        destination: "https://changes.light.so/changelog",
      },
      {
        source: "/changelog/:path*",
        destination: "https://changes.light.so/changelog/:path*",
      },
      {
        source: "/home",
        destination: "https://lightdotso.framer.website",
      },
      {
        source: "/home/:path*",
        destination: "https://lightdotso.framer.website/:path*",
      },
      {
        source: "/proposals",
        destination: "https://proposals.light.so/proposals",
      },
      {
        source: "/proposals/:path*",
        destination: "https://proposals.light.so/proposals/:path*",
      },
    ];
  },
  transpilePackages: [
    "@lightdotso/client",
    "@lightdotso/const",
    "@lightdotso/data",
    "@lightdotso/elements",
    "@lightdotso/forms",
    "@lightdotso/hooks",
    "@lightdotso/kysely",
    "@lightdotso/modals",
    "@lightdotso/msw",
    "@lightdotso/nuqs",
    "@lightdotso/params",
    "@lightdotso/prisma",
    "@lightdotso/query",
    "@lightdotso/query-keys",
    "@lightdotso/schemas",
    "@lightdotso/services",
    "@lightdotso/states",
    "@lightdotso/stores",
    "@lightdotso/styles",
    "@lightdotso/svg",
    "@lightdotso/tables",
    "@lightdotso/templates",
    "@lightdotso/types",
    "@lightdotso/ui",
    "@lightdotso/utils",
    "@lightdotso/validators",
    "@lightdotso/wagmi",
  ],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };

    // config.externals.push("react");

    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    // config.resolve.alias["react"] = path.resolve(__dirname, ".", "node_modules", "react");

    config.externals.push(
      "async_hooks",
      "pino-pretty",
      "lokijs",
      "encoding",
      "net",
    );

    config.resolve.fallback = { fs: false, net: false, tls: false };

    // This is only intended to pass CI and should be skiped in your app
    if (config.name === "server") {
      config.optimization.concatenateModules = false;
    }

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
  // withSerwistInit({
  //   swSrc: "app/sw.ts",
  //   swDest: "public/sw.js",
  // }),
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
