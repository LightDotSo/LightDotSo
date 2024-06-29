// Copyright 2023-2024 Light
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

// Full complete example from: https://github.com/hqasmei/youtube-tutorials/blob/ee44df8fbf6ab4f4c2f7675f17d67813947a7f61/vercel-animated-tabs/src/components/tabs.tsx
// License: MIT

"use client";

import { ConnectButton } from "@lightdotso/templates";
import { baseWidthWrapper } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { useMemo } from "react";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { AppNav } from "@/components/nav/app-nav";
import { TabsNav } from "@/components/nav/tabs-nav";
import { RootLogo } from "@/components/root/root-logo";
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
            {TabsNavComponent}
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};
