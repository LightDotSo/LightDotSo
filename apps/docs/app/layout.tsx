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

import "@lightdotso/styles/global.css";
import { source } from "@/app/source";
import { DOCS_TABS } from "@/const";
import { Root } from "@lightdotso/roots/root";
import { Footer } from "@lightdotso/templates/footer";
import { Nav } from "@lightdotso/templates/nav";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
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
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "https://assets.light.so/favicon.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/png",
      url: "https://assets.light.so/favicon-dark.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
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
      <Nav
        wrapperClassName="hidden md:block"
        layerClassName="max-w-full"
        tabs={DOCS_TABS}
      >
        <RootProvider>
          <DocsLayout tree={source.pageTree}>{children}</DocsLayout>
        </RootProvider>
      </Nav>
      <Footer />
    </Root>
  );
}
