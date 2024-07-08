import { type BaseLayoutProps, type DocsLayoutProps } from "fumadocs-ui/layout";
import { pageTree } from "@/source";

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
