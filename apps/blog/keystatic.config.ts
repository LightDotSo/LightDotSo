import { collection, config, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
    pathPrefix: "apps/blog",
  },
  cloud: {
    project: "lightdotso/blog",
  },
  collections: {
    posts: collection({
      label: "Blog",
      slugField: "title",
      path: "content/**",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        ogp: fields.cloudImage({ label: "OGP" }),
        content: fields.markdoc({ label: "Content", extension: "md" }),
      },
    }),
  },
});
