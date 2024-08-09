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

// Copyright 2023-2024 Vercel, Inc.
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
import { Header } from "@/components/header";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { Root } from "@lightdotso/templates";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata = {
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined,
  title: {
    default: "Next.js AI Chatbot",
    template: "%s - Next.js AI Chatbot",
  },
  description: "An AI-powered chatbot template built with Next.js and Vercel.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// -----------------------------------------------------------------------------
// Viewport
// -----------------------------------------------------------------------------

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
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
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 flex-col bg-muted/50">{children}</main>
        </div>
      </SidebarProvider>
    </Root>
  );
}
