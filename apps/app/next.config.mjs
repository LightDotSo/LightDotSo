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

import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { withSentryConfig } from "@sentry/nextjs";

const sentryWebpackPluginOptions = {
  silent: false,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    appDir: true,
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
    serverComponentsExternalPackages: [],
  },

  transpilePackages: ["@lightdotso/ui"],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };

    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    config.externals.push(
      "async_hooks",
      "pino-pretty",
      "lokijs",
      "encoding",
      "net",
    );
    // This is only intended to pass CI and should be skiped in your app
    if (config.name === "server")
      config.optimization.concatenateModules = false;

    return config;
  },
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
