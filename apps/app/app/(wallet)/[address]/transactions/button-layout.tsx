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

interface TransactionsButtonLayoutProps
  extends React.HTMLAttributes<HTMLElement> {
  items: {
    id: string;
    href: string;
    title: string;
  }[];
}

export function TransactionsButtonLayout({
  items,
}: TransactionsButtonLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get the last part of the path
  // Ex) /wallets/0x1234567890abcdef/transactions -> transactions
  // Ex) /wallets/0x1234567890abcdef/transactions/queue -> queue

  const id = pathname.split("/").pop();

  // Get the wallet address from the path
  // Address is the first part of the path
  const address = pathname.split("/")[1];

  // Prefetch all the pages
  items.forEach(item => {
    router.prefetch(`/${address}${item.href}`);
  });

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
        <div className="hidden sm:block">
          <nav className="flex" aria-label="Tabs">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={`/${address}${item.href}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  // If the item is the first, add rounded
                  index === 0 ? "rounded-r-none border-r-0" : "border-l-0",
                  // If the item is middle, don't add rounded
                  index !== 0 && index !== items.length - 1
                    ? "rounded-none"
                    : "",
                  // If the item is the last, add rounded
                  index === items.length - 1 ? "rounded-l-none" : "border-r-0",
                  // If the item is the selected, add bg-selected
                  item.id === id ? "bg-accent" : "",
                  // Add padding inside the button
                )}
                aria-current={item.id === id ? "page" : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
