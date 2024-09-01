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
import { LightHorizontalLogo } from "@lightdotso/svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@lightdotso/ui/components/navigation-menu";
import { cn } from "@lightdotso/utils";
import {
  DiscordLogoIcon,
  FileTextIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { CompassIcon, FileAxis3D, ScaleIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import type { ElementRef } from "react";
import { forwardRef } from "react";
import { FaTelegram } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const components: {
  title: string;
  href: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    title: "Blog",
    href: INTERNAL_LINKS.Blog,
    description: "Read the Light blog.",
    icon: <FileTextIcon className="h-5 w-5" />,
  },
  {
    title: "Changelog",
    href: INTERNAL_LINKS.Changelog,
    description: "View the Light changelog.",
    icon: <FileAxis3D className="h-5 w-5" />,
  },
  {
    title: "Discord",
    href: SOCIAL_LINKS.Discord,
    description: "Join the Light Discord.",
    icon: <DiscordLogoIcon className="h-5 w-5" />,
  },
  {
    title: "Github",
    href: SOCIAL_LINKS.Github,
    description: "Contribute to Light on Github.",
    icon: <GitHubLogoIcon className="h-5 w-5" />,
  },
  {
    title: "Telegram",
    href: SOCIAL_LINKS.Telegram,
    description: "Join the Light Telegram.",
    icon: <FaTelegram className="h-5 w-5" />,
  },
  {
    title: "Twitter",
    href: SOCIAL_LINKS.Twitter,
    description: "Follow Light on Twitter.",
    icon: <TwitterLogoIcon className="h-5 w-5" />,
  },
];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface GridProps {
  className?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const ListItem = forwardRef<
  ElementRef<"a">,
  ComponentPropsWithoutRef<"a"> & { icon?: ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-background-strong hover:text-text-strong focus:bg-background-strong focus:text-text-strong",
            className,
          )}
          {...props}
        >
          <div className="flex items-center space-x-2">
            {icon}
            <div className="font-medium text-sm leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm text-text-weak leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
export const Menu: FC<GridProps> = ({ className }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent">
            Getting started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-background/50 to-background p-6 no-underline outline-none hover:bg-background-strong focus:shadow-md"
                    href="/"
                  >
                    <LightHorizontalLogo className="h-10 w-16" />
                    <div className="mt-4 mb-2 font-medium text-lg">
                      Light App
                    </div>
                    <p className="text-sm text-text-weak leading-tight">
                      Experience using Light w/ the official app. Use Ethereum
                      as One.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href={INTERNAL_LINKS.Docs}
                title="Documentation"
                icon={<FileTextIcon className="h-5 w-5" />}
              >
                Learn how to use Light w/ our official product documentation.
              </ListItem>
              <ListItem
                href={INTERNAL_LINKS.Governance}
                title="Governance"
                icon={<ScaleIcon className="h-5 w-5" />}
              >
                Learn how to participate in Light governance.
              </ListItem>
              <ListItem
                href={INTERNAL_LINKS.Explorer}
                title="Explorer"
                icon={<CompassIcon className="h-5 w-5" />}
              >
                Interact with the Light Protocol explorer.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Official Links</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                  icon={component.icon}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <a href={INTERNAL_LINKS.Paper} target="_blank" rel="noreferrer">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Paper
            </NavigationMenuLink>
          </a>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
