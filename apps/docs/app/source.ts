import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { docs, meta } from "../source.config";

export const { getPage, getPages, pageTree } = loader({
  baseUrl: "/docs",
  // @ts-ignore
  source: createMDXSource(docs, meta),
});
