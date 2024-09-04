import { createMDX } from "fumadocs-mdx/next";
import packageJson from "./package.json" assert { type: "json" };

const withMDX = createMDX();
// ---------------------------------------------------------------------------
// Next Config
// ---------------------------------------------------------------------------

/** @type {import('next').NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_APP_VERSION: `@lightdotso/docs@${packageJson.version}`,
  },
  reactStrictMode: true,
  transpilePackages: ["prettier", "shiki"],
};

export default withMDX(config);
