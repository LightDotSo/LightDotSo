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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@lightdotso/utils";
import { buttonVariants } from "@lightdotso/ui";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Type
// -----------------------------------------------------------------------------

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
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
  const pathname = usePathname();

  // Get the 1st part of the pathname, if baseRef is true
  // This is used to highlight the current page in the sidebar
  // For example, if the current pathname is "/0x1234/settings",
  // the baseHref will be "/0x1234"

  const baseHref = baseRef ? pathname.split("/")[1] : undefined;

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
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline text-muted-foreground",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};
