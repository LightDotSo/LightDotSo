import "./global.css";
import { source } from "@/app/source";
import { DocsLayout } from "fumadocs-ui/layout";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
});

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsLayout tree={source.pageTree}>{children}</DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
