"use client";

import "./fumadocs.css";
import "@lightdotso/styles/global.css";
import { DocsLayout } from "fumadocs-ui/layout";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { docsOptions } from "./layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout {...docsOptions}>{children}</DocsLayout>
    </RootProvider>
  );
}
