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
import { WalletSwitcher } from "@/components/wallet-switcher";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { NotificationPopover } from "@/components/notification-popover";
import { FeedbackPopover } from "@/components/feedback-popover";
import { ConnectButton } from "@/components/connect-button";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { VercelToolbar } from "@/components/vercel-toolbar";
import { AuthState } from "@/components/auth-state";
import { RootLogo } from "@/app/root-logo";
import dynamic from "next/dynamic";

const CommandK = dynamic(() => import("@/components/command-k"), {
  ssr: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-white dark:bg-black">
        <ThemeProvider attribute="class">
          <ReactQueryProvider>
            <Web3Provider>
              <main>
                <div className="flex flex-col">
                  <div className="border-b lg:py-2">
                    <div className="flex h-16 items-center px-4 lg:px-8">
                      <div className="flex items-center">
                        <RootLogo />
                        <span className="ml-2 mr-1 text-primary/60">/</span>
                        <WalletSwitcher />
                      </div>
                      <div className="ml-auto flex items-center space-x-2.5">
                        {/* <Search /> */}
                        <FeedbackPopover />
                        <NotificationPopover />
                        <UserNav />
                        <ConnectButton />
                      </div>
                    </div>
                    <MainNav className="h-10 items-center px-4 lg:px-8" />
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
        <CommandK></CommandK>
        <TailwindIndicator />
        <Suspense>
          <VercelToolbar />
        </Suspense>
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
}
