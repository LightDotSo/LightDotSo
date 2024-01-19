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

import type { RawTab } from "@lightdotso/types";
import { AlignRight } from "lucide-react";
import Link from "next/link";
import type { FC, ReactNode } from "react";
import { Button } from "../../components/button";
import { ButtonIcon } from "../../components/button-icon";
import {
  Drawer,
  DrawerTrigger,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
  DrawerFooter,
} from "../../components/drawer";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface MobileAppDrawerProps {
  children?: ReactNode;
  tabs: RawTab[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const MobileAppDrawer: FC<MobileAppDrawerProps> = ({
  tabs,
  children,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
        <DrawerHeader>{children}</DrawerHeader>
        <DrawerBody>
          {tabs.map(tab => {
            if (tab.href.startsWith("http")) {
              return (
                <div key={tab.id} className="border-b border-border py-1.5">
                  <Button asChild className="w-full" variant="link">
                    <a className="flex justify-between" href={tab.href}>
                      <span className="flex">
                        <tab.icon className="size-4 mr-3" />
                        {tab.label}
                      </span>
                      <tab.icon className="size-4 fill-text-weak" />
                    </a>
                  </Button>
                </div>
              );
            }
            return (
              <div
                key={tab.id}
                className="border-b border-border first:border-t py-1.5"
              >
                <Button asChild variant="link">
                  <Link href={tab.href}>
                    <tab.icon className="size-4 mr-3" />
                    {tab.label}
                  </Link>
                </Button>
              </div>
            );
          })}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
