import { defineCollection, defineConfig } from "@content-collections/core";
import {
  createDocSchema,
  createMetaSchema,
  transformMDX,
} from "@fumadocs/content-collections/configuration";

const docs = defineCollection({
  name: "docs",
  directory: "content",
  include: "**/*.mdx",
  schema: createDocSchema,
  transform: transformMDX,
});

const metas = defineCollection({
  name: "meta",
  directory: "content",
  include: "**/meta.json",
  parser: "json",
  schema: createMetaSchema,
});

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  // @ts-expect-error
  collections: [docs, metas],
});
