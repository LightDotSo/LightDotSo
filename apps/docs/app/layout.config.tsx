import { pageTree } from "@/source";
import type { DocsLayoutProps } from "fumadocs-ui/layout";

export const docsOptions: DocsLayoutProps = {
  nav: {
    title: "Light Documentation",
  },
  links: [
    {
      text: "Documentation",
      url: "/",
      active: "nested-url",
    },
  ],

  tree: pageTree,
};
