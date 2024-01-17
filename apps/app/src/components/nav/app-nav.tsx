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

import { useAuth } from "@lightdotso/stores";
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
import type { FC } from "react";
import { Suspense } from "react";
import { ChainPopover } from "@/components/chain/chain-popover";
import { FeedbackPopover } from "@/components/feedback/feedback-popover";
import { UserNav } from "@/components/nav/user-nav";
import { ConnectButton } from "@/components/web3/connect-button";
import { useIsMounted, useMediaQuery } from "@/hooks";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AppNav: FC = () => {
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
    <div className="ml-auto hidden items-center space-x-2.5 md:flex">
      {address && (
        <>
          <Suspense>
            <ChainPopover />
          </Suspense>
          <FeedbackPopover />
          <UserNav />
        </>
      )}
      <ConnectButton />
    </div>
  );
};
