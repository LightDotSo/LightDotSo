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
import { BLOG_TABS } from "@/const";
import { Root } from "@lightdotso/roots/root";
import { Footer } from "@lightdotso/templates/footer";
import { Nav } from "@lightdotso/templates/nav";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Light Blog",
  description: "Light Blog - Use Ethereum as One.",
  metadataBase: new URL("https://light.so"),
  openGraph: {
    title: "Light Blog",
    description: "Light Blog - Use Ethereum as One.",
    url: "/",
    siteName: "Light Blog",
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
    title: "Light Blog",
    description: "Light Blog - Use Ethereum as One.",
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
      {/* Layout */}
      <Nav tabs={BLOG_TABS}>{children}</Nav>
      <Footer />
    </Root>
  );
}
