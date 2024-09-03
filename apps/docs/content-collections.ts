import { defineCollection, defineConfig } from "@content-collections/core";
import {
  createDocSchema,
  createMetaSchema,
  transformMDX,
} from "@fumadocs/content-collections/configuration";

export const docs = defineCollection({
  name: "docs",
  directory: "content",
  include: "./content/**/*.mdx",
  schema: createDocSchema,
  transform: transformMDX,
});

export const metas = defineCollection({
  name: "meta",
  directory: "content",
  include: "./content/**/meta.json",
  parser: "json",
  schema: createMetaSchema,
});

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  collections: [docs, metas],
});
