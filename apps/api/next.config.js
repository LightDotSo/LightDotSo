const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
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
  async headers() {
    // To help with local development...
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/auth/:path*",
          has: [{ type: "header", key: "Origin", value: "(?<origin>.*)" }],
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: ":origin" },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET, OPTIONS, PATCH, DELETE, POST, PUT",
            },
            {
              key: "Access-Control-Allow-Headers",
              value:
                "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
            },
          ],
        },
      ];
    }

    // In the other environments...
    return [
      // https://vercel.com/support/articles/how-to-enable-cors#enabling-cors-in-a-next.js-app
      // https://nextjs.org/docs/api-reference/next.config.js/headers#header-cookie-and-query-matching
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
      {
        source: "/api/auth/:path*",
        has: [
          {
            type: "header",
            key: "Origin",
            value: "(?<origin>^https://.*.light.so$)",
          },
        ],
        // these headers will be applied
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: ":origin" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS, PATCH, DELETE, POST, PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  outputFileTracing: true,
  transpilePackages: ["@lightdotso/trpc"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
};

module.exports = nextConfig;
