import { collection, config, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
    pathPrefix: "apps/proposals",
  },
  cloud: {
    project: "lightdotso/proposals",
  },
  collections: {
    posts: collection({
      label: "Proposals",
      slugField: "title",
      path: "content/proposals/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        ogp: fields.cloudImage({ label: "OGP" }),
        content: fields.markdoc({ label: "Content", extension: "md" }),
      },
    }),
  },
});
