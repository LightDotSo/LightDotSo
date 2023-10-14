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

import { headers } from "next/headers";
import {
  TailwindIndicator,
  ThemeProvider,
  TrpcProvider,
  Web3Provider,
  Toaster,
} from "@lightdotso/ui";
import "@lightdotso/styles/global.css";
import { WalletSwitcher } from "@/components/wallet-switcher";
import { Logo } from "@/components/light-logo";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { NotificationPopover } from "@/components/notification-popover";
import { FeedbackPopover } from "@/components/feedback-popover";
import { ConnectButton } from "@/components/connect-button";
import { siweConfig } from "@/components/siwe-button";
import Link from "next/link";
import Script from "next/script";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function Root({
  children,
  isTabEnabled = false,
}: {
  children: React.ReactNode;
  isTabEnabled?: boolean;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-[100dvh] bg-white dark:bg-black">
        <ThemeProvider attribute="class">
          <TrpcProvider headers={headers()}>
            <Web3Provider siweConfig={siweConfig}>
              <main>
                <div className="flex flex-col">
                  <div className="border-b py-2">
                    <div className="flex h-16 items-center px-4 lg:px-12">
                      <div className="flex items-center">
                        <Link
                          href="/"
                          className="hover:rounded-md hover:bg-accent"
                        >
                          <Logo className="m-2.5 h-8 w-8 fill-slate-600 dark:fill-slate-300" />
                        </Link>
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
                    {isTabEnabled && (
                      <MainNav className="h-10 items-center px-12" />
                    )}
                  </div>
                  {children}
                </div>
              </main>
              <Toaster />
            </Web3Provider>
          </TrpcProvider>
        </ThemeProvider>
        <TailwindIndicator />
      </body>
      <Script async src="https://data.light.so/p.js" />
    </html>
  );
}
