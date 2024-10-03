// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
        description: fields.text({
          label: "Description",
          validation: { isRequired: false },
        }),
        date: fields.date({ label: "Date", validation: { isRequired: true } }),
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        ogp: fields.cloudImage({
          label: "OGP",
          validation: { isRequired: true },
        }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
  },
});
