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

import { Button, ButtonGroup, buttonVariants } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { FC, HTMLAttributes, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsButtonLayoutProps extends HTMLAttributes<HTMLElement> {
  items: {
    id: string;
    href: string;
    title: string;
  }[];
  children?: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const LinkButtonGroup: FC<TransactionsButtonLayoutProps> = ({
  children,
  items,
}) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
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
      <nav className="flex items-center justify-between" aria-label="Tabs">
        <ButtonGroup
          variant="unstyled"
          className="hidden rounded-md border border-border bg-background-strong p-0.5 sm:block"
        >
          {items.map(item => (
            <Button
              key={item.id}
              asChild
              className={cn(
                "bg-transparent border-none py-0 text-sm h-8",
                // If the item is the selected, add bg-selected
                item.id === id
                  ? "bg-background-body text-text font-semibold hover:bg-background-weaker"
                  : "text-text-weak hover:text-text",
              )}
              variant="unstyled"
              size="sm"
            >
              <Link href={`/${address}${item.href}`}>{item.title}</Link>
            </Button>
          ))}
        </ButtonGroup>
        <div className="hidden items-center space-x-2 md:flex">{children}</div>
      </nav>
    </>
  );
};
