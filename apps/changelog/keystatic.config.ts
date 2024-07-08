import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
    pathPrefix: "apps/changelog",
  },
  cloud: {
    project: "lightdotso/changelog",
  },
  collections: {
    posts: collection({
      label: "Changelog",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        content: fields.markdoc({ label: "Content", extension: "md" }),
      },
    }),
  },
});
