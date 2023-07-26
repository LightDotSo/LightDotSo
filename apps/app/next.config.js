/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lightdotso/trpc", "@lightdotso/ui"],
};

module.exports = nextConfig;
