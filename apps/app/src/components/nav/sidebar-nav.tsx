// Copyright 2023-2024 Light.
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

import { buttonVariants } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC, HTMLAttributes } from "react";

// -----------------------------------------------------------------------------
// Type
// -----------------------------------------------------------------------------

interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
  baseRef?: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SidebarNav: FC<SidebarNavProps> = ({
  className,
  baseRef,
  items,
  ...props
}) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // Get the 1st part of the pathname, if baseRef is true
  // This is used to highlight the current page in the sidebar
  // For example, if the current pathname is "/0x1234/settings",
  // the baseHref will be "/0x1234"

  const baseHref = baseRef ? pathname.split("/")[1] : undefined;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map(item => (
        <Link
          key={item.href}
          href={baseHref ? "/" + baseHref + item.href : item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === (baseHref ? "/" + baseHref + item.href : item.href)
              ? "bg-background-stronger hover:bg-background-stronger"
              : "text-text-weak hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};
