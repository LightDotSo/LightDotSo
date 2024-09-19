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

// Full complete example from: https://github.com/hqasmei/youtube-tutorials/blob/ee44df8fbf6ab4f4c2f7675f17d67813947a7f61/vercel-animated-tabs/src/components/tabs.tsx
// License: MIT

"use client";
import { NavApp } from "@/components/nav/nav-app";
import { NavLogo } from "@/components/nav/nav-logo";
import { NavTabs } from "@/components/nav/nav-tabs";
import { WalletSwitcher } from "@/components/web3/wallet-switcher";
import { useTabs } from "@/hooks";
import { ConnectButton } from "@lightdotso/templates/connect-button";
import { NavWrapper } from "@lightdotso/templates/nav";
import { baseWidthWrapper } from "@lightdotso/ui/wrappers";
import { cn } from "@lightdotso/utils";
import { useMemo } from "react";
import type { FC, HTMLAttributes, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NavProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  topNavChildren?: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Nav: FC<NavProps> = ({ children, topNavChildren }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isTabsNavigationVisible, tabProps } = useTabs();

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const TabsNavComponent = useMemo(() => {
    return tabProps && <NavTabs {...tabProps} />;
  }, [tabProps]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NavWrapper
      topNavChildren={topNavChildren}
      nav={
        <>
          <div className="flex items-center">
            <NavLogo />
            <span className="mr-1 ml-2 text-text/60 last:hidden">/</span>
            <WalletSwitcher />
          </div>
          <NavApp mobile={<ConnectButton />} tabs={tabProps.tabs} />
        </>
      }
      navClassName={baseWidthWrapper}
      navChildren={
        isTabsNavigationVisible && (
          <div
            className={cn(
              "flex h-10 items-center space-x-4 lg:space-x-6",
              baseWidthWrapper,
            )}
          >
            {TabsNavComponent}
          </div>
        )
      }
    >
      {children}
    </NavWrapper>
  );
};
