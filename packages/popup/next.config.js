/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: !process.env.VERCEL ? "/popup" : "/",
};
