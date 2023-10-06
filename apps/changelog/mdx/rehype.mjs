// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { toString } from "mdast-util-to-string";
import { mdxAnnotations } from "mdx-annotations";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { remarkRehypeWrap } from "remark-rehype-wrap";
import shiki from "shiki";
import { visit } from "unist-util-visit";

let highlighter;

function rehypeShiki() {
  return async tree => {
    highlighter =
      highlighter ?? (await shiki.getHighlighter({ theme: "css-variables" }));

    visit(tree, "element", (node, _nodeIndex, parentNode) => {
      if (node.tagName === "code" && parentNode.tagName === "pre") {
        let language = node.properties.className?.[0]?.replace(
          /^language-/,
          "",
        );

        if (!language) {
          return;
        }

        let tokens = highlighter.codeToThemedTokens(
          node.children[0].value,
          language,
        );

        node.children = [];
        node.properties.highlightedCode = shiki.renderToHtml(tokens, {
          elements: {
            pre: ({ children }) => children,
            code: ({ children }) => children,
            line: ({ children }) => `<span>${children}</span>`,
          },
        });
      }
    });
  };
}

export const rehypePlugins = [
  mdxAnnotations.rehype,
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap", test: ["h2"] }],
  rehypeShiki,
  [
    remarkRehypeWrap,
    {
      node: { type: "element", tagName: "article" },
      start: "element[tagName=hr]",
      transform: article => {
        article.children.splice(0, 1);
        let heading = article.children.find(n => n.tagName === "h2");
        article.properties = {
          ...heading.properties,
          title: toString(heading),
        };
        heading.properties = {};
        return article;
      },
    },
  ],
];
