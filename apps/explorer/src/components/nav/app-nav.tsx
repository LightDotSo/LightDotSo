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
import { MobileAppDrawer } from "@lightdotso/template";
import type { Tab } from "@lightdotso/types";
import { Button } from "@lightdotso/ui";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type AppNavProps = {
  tabs: Tab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AppNav: FC<AppNavProps> = ({ tabs }) => {
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
    return <MobileAppDrawer tabs={tabs} />;
  }

  return (
    <div className="ml-auto hidden items-center space-x-1 md:flex">
      {tabs.map(tab => {
        if (tab.id === "app") {
          return (
            <Button
              key="app"
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
            key={tab.id}
            asChild
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
          >
            <Link href={tab.href}>{tab.label}</Link>
          </Button>
        );
      })}
    </div>
  );
};
