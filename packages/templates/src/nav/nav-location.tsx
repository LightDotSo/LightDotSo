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

import { useIsMounted, useMediaQuery } from "@lightdotso/hooks";
import type { Tab } from "@lightdotso/types";
import { Button } from "@lightdotso/ui";
import Link from "next/link";
import type { FC } from "react";
import { MobileAppDrawer } from "../mobile-app-drawer";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NavLocationProps = {
  tabs: Tab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NavLocation: FC<NavLocationProps> = ({ tabs }) => {
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
      {tabs.map((tab) => {
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
