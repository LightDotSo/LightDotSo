import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";

export const source = loader({
  baseUrl: "/",
  source: createMDXSource(docs, meta),
  pageTree: {
    attachFile,
  },
});

export const openapi = createOpenAPI();
