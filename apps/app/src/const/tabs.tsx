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

import type { Tab } from "@lightdotso/types";
import {
  ActivityLogIcon,
  DashboardIcon,
  WidthIcon,
  PersonIcon,
  MixerVerticalIcon,
  ChatBubbleIcon,
  RadiobuttonIcon,
  DesktopIcon,
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
  label: "Developer",
  id: "dev",
  href: "/dev",
  icon: (
    props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
  ) => <DesktopIcon {...props} />,
};
