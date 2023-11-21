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

import {
  TailwindIndicator,
  ThemeProvider,
  ReactQueryProvider,
  Web3Provider,
  Toaster,
} from "@lightdotso/ui";
import "@lightdotso/styles/global.css";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import type { FC } from "react";
import { AuthState } from "@/components/auth/auth-state";
import { VercelToolbar } from "@/components/dev/vercel-toolbar";
import { FeedbackPopover } from "@/components/feedback/feedback-popover";
import { MainNav } from "@/components/nav/main-nav";
import { UserNav } from "@/components/nav/user-nav";
import { RootLogo } from "@/components/root/root-logo";
import { ConnectButton } from "@/components/web3/connect-button";
import { WalletSwitcher } from "@/components/web3/wallet-switcher";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const CommandK = dynamic(() => import("@/components/command-k"), {
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
  children: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Root: FC<RootProps> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-background-body">
        <ThemeProvider attribute="class">
          <ReactQueryProvider>
            <Web3Provider>
              <main>
                <div className="flex flex-col">
                  <div className="border-b border-border lg:py-2">
                    <div className="flex h-16 items-center px-2 md:px-4 lg:px-8">
                      <div className="flex items-center">
                        <RootLogo />
                        <span className="ml-2 mr-1 text-text/60">/</span>
                        <WalletSwitcher />
                      </div>
                      <div className="ml-auto flex items-center space-x-2.5">
                        {/* <Search /> */}
                        <FeedbackPopover />
                        <UserNav />
                        <ConnectButton />
                      </div>
                    </div>
                    <MainNav className="h-10 items-center px-2 md:px-4 lg:px-8" />
                  </div>
                  {children}
                </div>
              </main>
              <Suspense fallback={null}>
                <AuthState />
              </Suspense>
              <Toaster />
            </Web3Provider>
          </ReactQueryProvider>
        </ThemeProvider>
        <CommandK />
        <TailwindIndicator />
        <Suspense>
          <VercelToolbar />
        </Suspense>
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
};
