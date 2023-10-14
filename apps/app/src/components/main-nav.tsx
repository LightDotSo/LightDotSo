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

import React, { useState } from "react";

import { Tabs } from "@/components/tabs-nav";
import { cn } from "@lightdotso/ui";
import { useTabs } from "@/hooks/useTabs";
import {
  DashboardIcon,
  WidthIcon,
  PersonIcon,
  MixerVerticalIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { useAccount } from "wagmi";

const tabs = [
  {
    label: "Overview",
    id: "overview",
    href: "/",
    number: 0,
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
    number: 10,
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
    number: 3,
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
    number: 3,
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
    number: 0,
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
}: React.HTMLAttributes<HTMLElement>) {
  const [hookProps] = useState({
    tabs,
  });
  const framer = useTabs(hookProps);
  const { address } = useAccount();

  // If the address is empty, return null
  if (!address) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {/* Render upon mount */}
      {framer && <Tabs {...framer.tabProps} />}
    </nav>
  );
}
