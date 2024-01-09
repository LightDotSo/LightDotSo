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

import {
  ActivityLogIcon,
  DashboardIcon,
  WidthIcon,
  PersonIcon,
  MixerVerticalIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { Suspense, useMemo, useState, useEffect } from "react";
import type { FC, HTMLAttributes, ReactNode, RefAttributes } from "react";
import { AppNav } from "@/components/nav/app-nav";
import { TabsNav } from "@/components/nav/tabs-nav";
import { RootLogo } from "@/components/root/root-logo";
import { WalletSwitcher } from "@/components/web3/wallet-switcher";
import { usePathType, useTabs } from "@/hooks";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const tabs = [
  {
    label: "Overview",
    id: "overview",
    href: "/overview",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <DashboardIcon {...props} />,
  },
  {
    label: "Transactions",
    id: "transactions",
    href: "/transactions",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <WidthIcon {...props} />,
  },
  {
    label: "Owners",
    id: "owners",
    href: "/owners",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <PersonIcon {...props} />,
  },
  {
    label: "Activity",
    id: "activity",
    href: "/activity",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <ActivityLogIcon {...props} />,
  },
  {
    label: "Settings",
    id: "settings",
    href: "/settings",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <MixerVerticalIcon {...props} />,
  },
  {
    label: "Support",
    id: "support",
    href: "/support",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <ChatBubbleIcon {...props} />,
  },
];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type MainNavProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const MainNav: FC<MainNavProps> = ({ children, ...props }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const type = usePathType();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const typeTabs = useMemo(() => {
    if (type === "demo") {
      return tabs.filter(tab => {
        // Don't return `settings` and `support` tabs
        return tab.id !== "settings" && tab.id !== "support";
      });
    }
    return tabs;
  }, [type]);

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [hookProps, setHookProps] = useState({
    tabs: typeTabs,
  });
  const framer = useTabs(hookProps);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setHookProps({ tabs: typeTabs });
  }, [typeTabs]);

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const Tabs = () => {
    if (type === "unauthenticated" || type === "authenticated") {
      return null;
    }

    return (
      <div
        className="flex items-center space-x-4 lg:space-x-6 h-10 items-center px-2 md:px-4 lg:px-8"
        {...props}
      >
        {/* Render upon mount */}
        <Suspense>{framer && <TabsNav {...framer.tabProps} />}</Suspense>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main>
      <div className="flex flex-col">
        <div className="border-b border-b-border py-2 overflow-y-visible">
          <div className="flex h-16 items-center px-2 md:px-4 lg:px-8">
            <div className="flex items-center">
              <RootLogo />
              <span className="ml-2 mr-1 text-text/60">/</span>
              <WalletSwitcher />
            </div>
            <AppNav />
          </div>
          <Tabs />
        </div>
        {children}
      </div>
    </main>
  );
};
