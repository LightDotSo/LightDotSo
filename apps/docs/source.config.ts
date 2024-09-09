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

// From: https://github.com/fuma-nama/fumadocs/blob/8282abed1b055395b7ee16523a7524c75002c18b/apps/docs/source.config.ts
// License: MIT
// Thank you to `fuma-nama` for the original implementation and great documentation.

import { transformerRemoveNotationEscape } from "@shikijs/transformers";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import {
  fileGenerator,
  remarkDocGen,
  remarkInstall,
  typescriptGenerator,
} from "fumadocs-docgen";
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { z } from "zod";

export const { docs, meta } = defineDocs({
  docs: {
    dir: "content",
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false),
      method: z.string().optional(),
    }),
  },
});

export default defineConfig({
  generateManifest: true,
  lastModifiedTime: "git",
  mdxOptions: {
    rehypeCodeOptions: {
      inline: "tailing-curly-colon",
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
        transformerRemoveNotationEscape(),
      ],
    },
    remarkPlugins: [
      remarkMath,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [typescriptGenerator(), fileGenerator()] }],
    ],
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
