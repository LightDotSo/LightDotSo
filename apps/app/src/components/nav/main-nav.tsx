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

// Full complete example from: https://github.com/hqasmei/youtube-tutorials/blob/ee44df8fbf6ab4f4c2f7675f17d67813947a7f61/vercel-animated-tabs/src/components/tabs.tsx
// License: MIT

"use client";

import { baseWidthWrapper } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { Suspense, useMemo } from "react";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { AppNav } from "@/components/nav/app-nav";
import { TabsNav } from "@/components/nav/tabs-nav";
import { RootLogo } from "@/components/root/root-logo";
import { ConnectButton } from "@/components/web3/connect-button";
import { WalletSwitcher } from "@/components/web3/wallet-switcher";
import { useTabs } from "@/hooks";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type MainNavProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const MainNav: FC<MainNavProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { tabProps } = useTabs();

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const TabsNavComponent = useMemo(() => {
    return tabProps && <TabsNav {...tabProps} />;
  }, [tabProps]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main>
      <div className="flex flex-col">
        <div className="overflow-y-visible border-b border-b-border py-2">
          <div className={cn("flex h-16 items-center", baseWidthWrapper)}>
            <div className="flex items-center">
              <RootLogo />
              <span className="ml-2 mr-1 text-text/60 last:hidden">/</span>
              <WalletSwitcher />
            </div>
            <AppNav mobile={<ConnectButton />} tabs={tabProps.tabs} />
          </div>
          <div
            className={cn(
              "flex h-10 items-center space-x-4 lg:space-x-6",
              baseWidthWrapper,
            )}
          >
            <Suspense>{TabsNavComponent}</Suspense>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};
