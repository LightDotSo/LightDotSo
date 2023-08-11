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
  async headers() {
    return [
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
    ];
  },
  outputFileTracing: true,
  transpilePackages: ["@lightdotso/trpc", "@lightdotso/ui"],
  webpack: config => {
    config.externals.push("async_hooks", "pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };

    return config;
  },
};

module.exports = nextConfig;
