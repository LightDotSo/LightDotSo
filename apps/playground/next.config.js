/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
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
    serverComponentsExternalPackages: ["@trpc/server"],
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
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-vercel-ip-latitude, x-real-ip, x-forwarded-for,Accept-Language, Content-Type, Forwarded, Referer, Sec-Ch-Ua, Sec-Ch-Ua-Mobile, Sec-Ch-Ua-Platform, Trpc-Batch-Mode, Upgrade-Insecure-Requests, User-Agent, X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto, X-Matched-Path, X-Real-Ip, X-Trpc-Source, X-Vercel-Deployment-Url, X-Vercel-Forwarded-For, X-Vercel-Id, X-Vercel-Ip-Country, X-Vercel-Ip-Country-Region, X-Vercel-Ip-Latitude, X-Vercel-Ip-Longitude, X-Vercel-Ip-Timezone, X-Vercel-Proxied-For, X-Vercel-Proxy-Signature, X-Vercel-Proxy-Signature-Ts, X-Vercel-Sc-Headers",
          },
        ],
      },
    ];
  },
  transpilePackages: ["@lightdotso/trpc", "@lightdotso/ui"],
  webpack: config => {
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

module.exports = nextConfig;
