import "./global.css";
import "@lightdotso/styles/global.css";
import { source } from "@/app/source";
import { DOCS_TABS } from "@/const";
import { Root } from "@lightdotso/roots/root";
import { Footer } from "@lightdotso/templates/footer";
import { Nav } from "@lightdotso/templates/nav";
import { DocsLayout } from "fumadocs-ui/layout";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    template: "%s | Light Docs",
    default: "Light Docs",
  },
  description: "Light Docs - Use Ethereum as One.",
  metadataBase: new URL("https://light.so"),
  openGraph: {
    title: "Light Docs",
    description: "Light Docs - Use Ethereum as One.",
    url: "/",
    siteName: "Light Docs",
    images: [
      {
        url: "https://assets.light.so/social/docs.png",
        width: 1200,
        height: 675,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Docs",
    description: "Light Docs - Use Ethereum as One.",
    creator: "@LightDotSo",
    images: [
      {
        url: "https://assets.light.so/social/docs.png",
        width: 1200,
        height: 675,
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// Viewport
// -----------------------------------------------------------------------------

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "var(--bg-background)",
    },
    { media: "(prefers-color-scheme: dark)", color: "var(--bg-background)" },
  ],
};

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Root>
      <Nav layerClassName="max-w-full" tabs={DOCS_TABS}>
        <RootProvider>
          <DocsLayout tree={source.pageTree}>{children}</DocsLayout>
        </RootProvider>
      </Nav>
      <Footer />
    </Root>
  );
}
