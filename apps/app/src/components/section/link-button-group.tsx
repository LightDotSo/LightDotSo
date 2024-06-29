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

import {
  Button,
  ButtonGroup,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToolbarSectionWrapper,
} from "@lightdotso/ui";
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
  // Local Variables
  // ---------------------------------------------------------------------------

  // Get the last part of the path
  // Ex) /wallets/0x1234567890abcdef/transactions -> transactions
  // Ex) /wallets/0x1234567890abcdef/transactions/queue -> queue

  const id = pathname.split("/").pop();

  // Get the wallet address from the path
  // Address is the first part of the path
  const address = pathname.split("/")[1];

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Prefetch all the pages
    items.forEach(item => {
      router.prefetch(`/${address}${item.href}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="sm:hidden">
        <Label htmlFor="tabs" className="sr-only">
          Select a tab
        </Label>
        <Select
          name="tabs"
          onValueChange={value => {
            // Get the item from the items
            const item = items.find(item => item.id === value);
            // If the item is not found, return
            if (!item) return;
            // Navigate to the item
            router.push(`/${address}${item.href}`);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category." />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {items.map(item => (
              <SelectItem key={item.id} value={item.id}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ToolbarSectionWrapper>
        <ButtonGroup
          variant="unstyled"
          className="hidden space-x-1 rounded-md border border-border bg-background-strong p-0.5 sm:block"
        >
          {items.map(item => (
            <Button
              key={item.id}
              asChild
              className={cn(
                "text-sm",
                // If the item is the selected, add bg-selected
                item.id === id
                  ? "hover:bg-background-weaker bg-background-body font-semibold text-text"
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
      </ToolbarSectionWrapper>
    </>
  );
};
