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

"use client";

import { SOCIAL_LINKS } from "@lightdotso/const";
import type { Tab } from "@lightdotso/types";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { RefAttributes } from "react";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const CHANGELOG_TABS: Tab[] = [
  {
    title: "Discord",
    id: "discord",
    href: SOCIAL_LINKS.Discord,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <DiscordLogoIcon {...props} />,
  },
  {
    title: "Github",
    id: "github",
    href: SOCIAL_LINKS.Github,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <GitHubLogoIcon {...props} />,
  },
  {
    title: "X",
    id: "x",
    href: SOCIAL_LINKS.Twitter,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <TwitterLogoIcon {...props} />,
  },
];
