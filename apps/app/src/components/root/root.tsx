// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use client";

import {
  TailwindIndicator,
  ThemeProvider,
  ReactQueryProvider,
  Toaster,
  Footer,
} from "@lightdotso/ui";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import type { FC, ReactNode } from "react";
import { AuthState } from "@/components/auth/auth-state";
import { VercelToolbar } from "@/components/dev/vercel-toolbar";
import { MainNav } from "@/components/nav/main-nav";
import { Web3Provider } from "@/components/web3/web3-provider";
import { WssState } from "@/components/wss/wss-state";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const AuthModal = dynamic(() => import("@/components/auth/auth-modal"), {
  ssr: false,
});

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Root: FC<RootProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} font-sans`}
    >
      <body className="min-h-[100dvh] bg-background-body">
        <ThemeProvider attribute="class">
          <ReactQueryProvider>
            <Web3Provider>
              <MainNav>{children}</MainNav>
              <Footer />
              {/* Utility Functions */}
              <CommandK />
              <Toaster />
              {/* Modals */}
              <AuthModal />
              {/* States */}
              <AuthState />
              <WssState />
            </Web3Provider>
          </ReactQueryProvider>
        </ThemeProvider>
        <TailwindIndicator />
        <Suspense>
          <VercelToolbar />
        </Suspense>
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
};
