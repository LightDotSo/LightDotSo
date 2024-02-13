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

import type { Tab } from "@lightdotso/types";
import {
  ActivityLogIcon,
  DashboardIcon,
  WidthIcon,
  PersonIcon,
  MixerVerticalIcon,
  ChatBubbleIcon,
  RadiobuttonIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { RefAttributes } from "react";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const DEFAULT_TABS: Tab[] = [
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

export const HOME_TABS: Tab[] = [
  {
    label: "New",
    id: "new",
    href: "/new",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <RadiobuttonIcon {...props} />,
  },
];

export const AI_TAB = {
  label: "AI",
  id: "ai",
  href: "/ai",
  icon: (
    props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
  ) => <RadiobuttonIcon {...props} />,
};

export const DEV_TAB = {
  label: "Dev",
  id: "dev",
  href: "/dev",
  icon: (
    props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
  ) => <RadiobuttonIcon {...props} />,
};
