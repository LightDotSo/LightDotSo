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

import { AuthState } from "@lightdotso/states";
import { Footer } from "@lightdotso/templates";
import {
  TailwindIndicator,
  ThemeProvider,
  ReactQueryProvider,
  Toaster,
  VercelToolbar,
  Web3Provider,
} from "@lightdotso/ui";
import { cookieToInitialState, wagmiConfig } from "@lightdotso/wagmi";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import type { FC, ReactNode } from "react";
import { MainNav } from "@/components/nav/main-nav";
import { WssState } from "@/components/wss/wss-state";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const AuthModal = dynamic(
  () => import("@lightdotso/modals/src/auth/auth-modal"),
  {
    ssr: false,
  },
);

const DepositModal = dynamic(
  () => import("@/components/deposit/deposit-modal"),
  {
    ssr: false,
  },
);

const NftModal = dynamic(() => import("@/components/nft/nft-modal"), {
  ssr: false,
});

const TokenModal = dynamic(() => import("@/components/token/token-modal"), {
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
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie"),
  );

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
            <Web3Provider initialState={initialState}>
              {/* Layout */}
              <MainNav>{children}</MainNav>
              <Footer />
              {/* Utility Functions */}
              <CommandK />
              <Toaster />
              {/* Modals */}
              <AuthModal />
              <DepositModal />
              <NftModal />
              <TokenModal />
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
