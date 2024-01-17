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

import { useIsMounted, useMediaQuery } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import type { RawTab } from "@lightdotso/types";
import {
  Button,
  ButtonIcon,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
} from "@lightdotso/ui";
import { AlignRight } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type AppNavProps = {
  tabs: RawTab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AppNav: FC<AppNavProps> = ({ tabs }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();
  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isMounted) {
    return null;
  }

  if (!isDesktop) {
    return (
      <Drawer>
        <div className="ml-auto">
          <DrawerTrigger>
            <ButtonIcon variant="outline" size="sm">
              <AlignRight className="size-4" />
            </ButtonIcon>
          </DrawerTrigger>
        </div>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="ml-auto hidden items-center space-x-1 md:flex">
      {tabs.map(tab => {
        if (tab.id === "app") {
          return (
            <Button
              asChild
              variant="link"
              size="sm"
              className="text-sm font-medium"
            >
              <a href={tab.href} target="_blank" rel="noreferrer">
                {<tab.icon className="mr-2 size-4" />}
                {tab.label}
              </a>
            </Button>
          );
        }

        return (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
          >
            <Link href={tab.href}>
              {<tab.icon className="mr-2 size-4" />}
              {tab.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
};
