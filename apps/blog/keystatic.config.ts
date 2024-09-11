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
        date: fields.date({ label: "Date", validation: { isRequired: true } }),
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        ogp: fields.cloudImage({
          label: "OGP",
          validation: { isRequired: true },
        }),
        content: fields.mdx({ label: "Content" }),
        preview: fields.checkbox({ label: "Preview" }),
      },
    }),
  },
});
