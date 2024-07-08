import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const config = {
  basePath: "/docs",
  reactStrictMode: true,
};

export default withContentCollections(config);
