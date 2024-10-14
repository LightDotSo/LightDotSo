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
import { EXPLORER_TABS } from "@/const";
import { Root } from "@lightdotso/roots/root";
import { Banner } from "@lightdotso/templates/banner";
import { Footer } from "@lightdotso/templates/footer";
import { Nav } from "@lightdotso/templates/nav";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    template: "%s | Light Explorer",
    default: "Light Explorer",
  },
  description: "Light Explorer - Use Ethereum as One.",
  icons: [
    {
      rel: "icon",
      type: "image/x-icon",
      url: "/favicon.ico",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/png",
      url: "/favicon-dark.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
  metadataBase: new URL("https://light.so"),
  openGraph: {
    title: "Light Explorer",
    description: "Light Explorer - Use Ethereum as One.",
    url: "/",
    siteName: "Light Explorer",
    images: [
      {
        url: "https://assets.light.so/social/use-ethereum-as-one.png",
        width: 1200,
        height: 675,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Explorer",
    description: "Light Explorer - Use Ethereum as One.",
    creator: "@LightDotSo",
    images: [
      {
        url: "https://assets.light.so/social/use-ethereum-as-one.png",
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
// Props
// -----------------------------------------------------------------------------

interface RootLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Root>
      <Nav topNavChildren={<Banner kind="beta" />} tabs={EXPLORER_TABS}>
        {children}
      </Nav>
      <Footer />
    </Root>
  );
}
