import "@lightdotso/styles/global.css";
import { Root } from "@lightdotso/templates";
import { DocsLayout } from "fumadocs-ui/layout";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

import "./fumadocs.css";
import { docsOptions } from "./layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Root>
      <RootProvider>
        <DocsLayout {...docsOptions}>{children}</DocsLayout>
      </RootProvider>
    </Root>
  );
}
