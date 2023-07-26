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
  },
  outputFileTracing: true,
  transpilePackages: ["@lightdotso/trpc", "@lightdotso/ui"],
};

module.exports = nextConfig;
