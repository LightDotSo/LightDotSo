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

import { buttonVariants } from "@lightdotso/ui";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@lightdotso/utils";
import type { FC } from "react";
import { useEffect } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsButtonLayoutProps
  extends React.HTMLAttributes<HTMLElement> {
  items: {
    id: string;
    href: string;
    title: string;
  }[];
  children?: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const LinkButtonGroup: FC<TransactionsButtonLayoutProps> = ({
  children,
  items,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Get the last part of the path
  // Ex) /wallets/0x1234567890abcdef/transactions -> transactions
  // Ex) /wallets/0x1234567890abcdef/transactions/queue -> queue

  const id = pathname.split("/").pop();

  // Get the wallet address from the path
  // Address is the first part of the path
  const address = pathname.split("/")[1];

  useEffect(() => {
    // Prefetch all the pages
    items.forEach(item => {
      router.prefetch(`/${address}${item.href}`);
    });
  }, [address, items, router]);

  return (
    <div className="flex w-full pt-8 lg:justify-end">
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            defaultValue={id}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "block w-full px-8",
            )}
            onChange={event => {
              // Get the selected value
              const value = event.target.value;
              // Get the item from the items
              const item = items.find(item => item.id === value);
              // If the item is not found, return
              if (!item) return;
              // Navigate to the item
              router.push(`/${address}${item.href}`);
            }}
          >
            {items.map(item => (
              <option key={item.id}>{item.title}</option>
            ))}
          </select>
        </div>
        <nav className="flex items-center space-x-4" aria-label="Tabs">
          {children}
          <div className="hidden rounded-md border border-border-primary-weak p-1 sm:block">
            {items.map(item => (
              <Link
                key={item.id}
                href={`/${address}${item.href}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-secondary bg-transparent hover:bg-transparent border-none text-xs",
                  // If the item is the selected, add bg-selected
                  item.id === id
                    ? "bg-background-stronger text-primary font-semibold hover:bg-background-stronger"
                    : "text-muted-foreground",
                )}
                aria-current={item.id === id ? "page" : undefined}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
