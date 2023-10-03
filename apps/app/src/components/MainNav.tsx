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

import { Tabs } from "@/components/Tabs";
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

export function MainNav({
  // eslint-disable-next-line react/prop-types
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [hookProps] = useState({
    tabs: [
      {
        label: "Overview",
        id: "Overview",
        href: "/",
        number: 3,
        icon: (
          props: React.JSX.IntrinsicAttributes &
            IconProps &
            React.RefAttributes<SVGSVGElement>,
        ) => <DashboardIcon {...props} />,
      },
      {
        label: "Transactions",
        id: "Transactions",
        href: "/",
        number: 3,
        icon: props => <WidthIcon {...props} />,
      },
      {
        label: "Members",
        id: "Members",
        href: "/",
        number: 3,
        icon: props => <PersonIcon {...props} />,
      },
      {
        label: "Settings",
        id: "Settings",
        href: "/",
        number: 3,
        icon: props => <MixerVerticalIcon {...props} />,
      },
      {
        label: "Support",
        id: "Support",
        href: "/",
        number: 3,
        icon: props => <ChatBubbleIcon {...props} />,
      },
    ],
    initialTabId: "Overview",
  });
  const framer = useTabs(hookProps);

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Tabs {...framer.tabProps} />
    </nav>
  );
}
