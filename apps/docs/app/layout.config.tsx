import { pageTree } from "@/source";
import type { BaseLayoutProps, DocsLayoutProps } from "fumadocs-ui/layout";

export const baseOptions: BaseLayoutProps = {
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
};

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,

  tree: pageTree,
};
