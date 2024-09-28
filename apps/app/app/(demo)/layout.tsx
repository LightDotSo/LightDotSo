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

import { MSWState } from "@/components/msw/msw-state";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    template: "Light Demo | %s",
    default: "Light Demo",
  },
  description:
    "Light Demo - A demo of the Light app for showcasing features and design.",
  openGraph: {
    title: "Light Demo",
    description:
      "Light Demo - A demo of the Light app for showcasing features and design.",
    url: "/demo",
    siteName: "Light Demo",
    images: [
      {
        url: "https://assets.light.so/social/demo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Demo",
    description:
      "Light Demo - A demo of the Light app for showcasing features and design.",
    creator: "@LightDotSo",
    images: [
      {
        url: "https://assets.light.so/social/demo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type RootLayoutProps = {
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function RootLayout({ children }: RootLayoutProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <MSWState />
      {children}
    </>
  );
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export const experimental_ppr = true;
export const revalidate = 300;
