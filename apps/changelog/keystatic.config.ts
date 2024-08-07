import { collection, config, fields } from "@keystatic/core";

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
      path: "content/**",
      format: { contentField: "content" },
      schema: {
        issue: fields.integer({
          label: "Issue",
          validation: { isRequired: true },
        }),
        date: fields.date({ label: "Date", validation: { isRequired: true } }),
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        ogp: fields.cloudImage({
          label: "OGP",
          validation: { isRequired: true },
        }),
        content: fields.markdoc({ label: "Content", extension: "md" }),
      },
    }),
  },
});
