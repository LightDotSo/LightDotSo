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

import { Button } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sideNav = [
  {
    name: "Overview",
    href: "/",
  },
  {
    name: "Server Components",
    href: "/rsc",
  },
  {
    name: "Server Actions 1",
    href: "/server-action",
  },
  {
    name: "Server Actions 2",
    href: "/alt-server-action",
  },
  {
    name: "React Query",
    href: "/react-query",
  },
  {
    name: "Full stack Invalidation",
    href: "/post-example",
  },
];

export function SideNav(props: { children: React.ReactNode }) {
  const page = usePathname();

  return (
    <div className="flex w-full flex-col sm:flex-row sm:py-6">
      <div className="order-first w-full flex-none sm:w-56">
        <div className="flex flex-row justify-between gap-x-4 gap-y-2 p-4 sm:flex-col sm:p-6">
          {sideNav.map(item => (
            <Button
              asChild
              // disabled={item.disabled}
              variant="ghost"
              className="justify-start gap-2"
              key={item.href}
            >
              <Link
                href={item.href}
                className={cn(
                  page === item.href && "bg-background-stronger text-text/80",
                  // item.disabled && 'pointer-events-none opacity-50',
                )}
              >
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="order-last min-h-screen w-screen p-4 pt-0 sm:w-full sm:p-6 md:order-none">
        {props.children}
      </div>
    </div>
  );
}
