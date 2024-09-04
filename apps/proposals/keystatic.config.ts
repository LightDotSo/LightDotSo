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
        authors: fields.array(fields.text({ label: "Author" })),
        date: fields.date({ label: "Date", validation: { isRequired: true } }),
        title: fields.slug({ name: { label: "Title" } }),
        ogp: fields.cloudImage({ label: "OGP" }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
  },
});
