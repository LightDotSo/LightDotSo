import { withContentCollections } from "@content-collections/next";
import packageJson from "./package.json" assert { type: "json" };

// ---------------------------------------------------------------------------
// Next Config
// ---------------------------------------------------------------------------

/** @type {import('next').NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_APP_VERSION: `@lightdotso/docs@${packageJson.version}`,
  },
  reactStrictMode: true,
};

export default withContentCollections(config);
