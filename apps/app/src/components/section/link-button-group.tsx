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

import type { Tab } from "@lightdotso/types";
import { Button } from "@lightdotso/ui/components/button";
import { ButtonGroup } from "@lightdotso/ui/components/button-group";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerTrigger,
} from "@lightdotso/ui/components/drawer";
import { ToolbarSectionWrapper } from "@lightdotso/ui/wrappers";
import { cn } from "@lightdotso/utils";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { type Address, isAddress } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionsButtonLayoutProps extends HTMLAttributes<HTMLElement> {
  tabs: Tab[];
  children?: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const LinkButtonGroup: FC<TransactionsButtonLayoutProps> = ({
  children,
  tabs,
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

  // However, if some of the ids will end with same string, so in that case we
  // need to get the last two parts of the path
  // Ex) /wallets/0x1234567890abcdef/deposit/new -> deposit/new
  // Ex) /wallets/0x1234567890abcdef/send/new -> send/new

  // If all of the item href ends with the same string, we need to omit the last
  // part of the path

  // Get the last part of the href of all the items
  const tabHrefs = tabs.map((tab) => tab.href.split("/").pop());

  // If all the item hrefs are the same, get the same last part of the path
  const tabSegment = tabHrefs.every((val, _i, arr) => val === arr[0])
    ? tabHrefs[0]
    : null;

  // If itemSegment is not null, and the current path ends with the itemSegment,
  // get the second last part of the path
  const id =
    tabSegment && pathname.endsWith(tabSegment)
      ? pathname.split("/").slice(-2, -1)[0]
      : pathname.split("/").pop();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the wallet address from the path
  // Address is the first part of the path
  const address = useMemo(() => {
    const maybeAddress = pathname.split("/")[1];
    if (!maybeAddress) {
      return undefined;
    }
    if (!isAddress(maybeAddress)) {
      if (maybeAddress === "demo") {
        return "demo";
      }

      return undefined;
    }
    return maybeAddress as Address;
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Prefetch all the pages
    // biome-ignore lint/complexity/noForEach: <explanation>
    tabs.forEach((tab) => {
      router.prefetch(`${address ? `/${address}` : ""}${tab.href}`);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="sm:hidden">
        <Drawer shouldScaleBackground>
          <DrawerTrigger asChild>
            <Button
              className="flex w-full justify-between bg-background-body"
              variant="outline"
            >
              <span>{id ? id.charAt(0).toUpperCase() + id.slice(1) : ""}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerBody>
              <div>
                {tabs.map((tab) => (
                  <Button
                    variant="link"
                    key={tab.id}
                    size="lg"
                    onClick={() => {
                      router.push(`${address ? `/${address}` : ""}${tab.href}`);
                    }}
                    className="block"
                  >
                    {tab.title}
                  </Button>
                ))}
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
      <ToolbarSectionWrapper>
        <ButtonGroup
          variant="unstyled"
          className="hidden space-x-1 rounded-md border border-border bg-background-strong p-0.5 sm:block"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              asChild
              variant="ghost"
              className={cn(
                "text-sm text-text-weak data-[variant=ghost]:text-text-weak",
                // If the item is the selected, add bg-selected
                tab.id === id
                  ? "bg-background-body font-semibold hover:bg-background-strong data-[variant=ghost]:text-text"
                  : "font-medium text-text-weak hover:text-text-weaker",
              )}
              size="sm"
            >
              <Link href={`${address ? `/${address}` : ""}${tab.href}`}>
                {tab.title}
              </Link>
            </Button>
          ))}
        </ButtonGroup>
        <div className="hidden items-center space-x-2 md:flex">{children}</div>
      </ToolbarSectionWrapper>
    </>
  );
};
