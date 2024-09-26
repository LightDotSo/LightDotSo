/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.VERCEL_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: process.env.VERCEL ? "/" : "/popup",
};
