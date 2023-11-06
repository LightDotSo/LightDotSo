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

import React, { Suspense, useState } from "react";

import { Tabs } from "@/components/tabs-nav";
import { cn } from "@lightdotso/utils";
import { useTabs } from "@/hooks/useTabs";
import {
  DashboardIcon,
  WidthIcon,
  PersonIcon,
  MixerVerticalIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { usePathType } from "@/hooks/usePathType";

const tabs = [
  {
    label: "Overview",
    id: "overview",
    href: "/",
    icon: (
      props: React.JSX.IntrinsicAttributes &
        IconProps &
        React.RefAttributes<SVGSVGElement>,
    ) => <DashboardIcon {...props} />,
  },
  {
    label: "Transactions",
    id: "transactions",
    href: "/transactions",
    icon: (
      props: React.JSX.IntrinsicAttributes &
        IconProps &
        React.RefAttributes<SVGSVGElement>,
    ) => <WidthIcon {...props} />,
  },
  {
    label: "Members",
    id: "members",
    href: "/members",
    icon: (
      props: React.JSX.IntrinsicAttributes &
        IconProps &
        React.RefAttributes<SVGSVGElement>,
    ) => <PersonIcon {...props} />,
  },
  {
    label: "Settings",
    id: "settings",
    href: "/settings",
    icon: (
      props: React.JSX.IntrinsicAttributes &
        IconProps &
        React.RefAttributes<SVGSVGElement>,
    ) => <MixerVerticalIcon {...props} />,
  },
  {
    label: "Support",
    id: "support",
    href: "/support",
    icon: (
      props: React.JSX.IntrinsicAttributes &
        IconProps &
        React.RefAttributes<SVGSVGElement>,
    ) => <ChatBubbleIcon {...props} />,
  },
];

export function MainNav({
  // eslint-disable-next-line react/prop-types
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement> & {}) {
  const type = usePathType();
  const [hookProps] = useState({
    tabs: type === "wallet" ? tabs : tabs.slice(0, 3),
  });
  const framer = useTabs(hookProps);

  return (
    <div
      className={cn(
        "flex items-center space-x-4 lg:space-x-6 overflow-x-scroll overflow-y-visible lg:overflow-x-visible scrollbar-none",
        className,
      )}
      {...props}
    >
      {/* Render upon mount */}
      <Suspense>{framer && <Tabs {...framer.tabProps} />}</Suspense>
    </div>
  );
}
