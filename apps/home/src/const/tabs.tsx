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

import { INTERNAL_LINKS, SOCIAL_LINKS } from "@lightdotso/const";
import type { Tab } from "@lightdotso/types";
import {
  DiscordLogoIcon,
  FileTextIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { FileAxis3D } from "lucide-react";
import type { RefAttributes } from "react";
import { FaTelegram } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const HOME_TABS: Tab[] = [
  {
    label: "Blog",
    id: "blog",
    description: "Read our latest blog posts.",
    href: INTERNAL_LINKS.Blog,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <FileTextIcon {...props} />,
    isTextOnly: true,
  },
  {
    label: "Changelog",
    id: "changelog",
    description: "View our changelog.",
    href: INTERNAL_LINKS.Changelog,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <FileAxis3D {...props} />,
    isTextOnly: true,
  },
  {
    label: "Discord",
    id: "discord",
    description: "Join our Discord server.",
    href: SOCIAL_LINKS.Discord,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <DiscordLogoIcon {...props} />,
    isTextOnly: true,
  },
  {
    label: "Github",
    id: "github",
    description: "View our Github repository.",
    href: SOCIAL_LINKS.Github,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <GitHubLogoIcon {...props} />,
    isTextOnly: true,
  },
  {
    label: "Telegram",
    id: "telegram",
    description: "Join our Telegram group.",
    href: SOCIAL_LINKS.Telegram,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <FaTelegram {...props} />,
    isTextOnly: true,
  },
  {
    label: "Twitter",
    id: "twitter",
    description: "Follow us on Twitter.",
    href: SOCIAL_LINKS.Twitter,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <TwitterLogoIcon {...props} />,
    isTextOnly: true,
  },
];
