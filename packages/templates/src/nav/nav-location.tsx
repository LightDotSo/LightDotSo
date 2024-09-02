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

import { INTERNAL_LINKS } from "@lightdotso/const";
import { useIsMounted, useMediaQuery } from "@lightdotso/hooks";
import type { Tab } from "@lightdotso/types";
import { Button } from "@lightdotso/ui/components/button";
import { ButtonIcon } from "@lightdotso/ui/components/button-icon";
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
    return (
      <MobileAppDrawer tabs={tabs}>
        <Button asChild>
          <Link href={INTERNAL_LINKS.App}>Launch App</Link>
        </Button>
      </MobileAppDrawer>
    );
  }

  return (
    <div className="ml-auto hidden items-center space-x-1 md:flex">
      {tabs.map((tab) => {
        return tab.isTextOnly ? (
          <Button
            key={tab.id}
            asChild
            variant="ghost"
            className="font-medium text-sm"
            size="sm"
          >
            <Link href={tab.href}>{tab.label}</Link>
          </Button>
        ) : (
          <ButtonIcon
            key={tab.id}
            asChild
            variant="ghost"
            className="font-medium text-sm"
          >
            {tab.href.startsWith("/") || tab.href === INTERNAL_LINKS.Home ? (
              <Link href={tab.href}>
                <NavLocationContent tab={tab} />
              </Link>
            ) : (
              <a href={tab.href} target="_blank" rel="noreferrer">
                <NavLocationContent tab={tab} />
              </a>
            )}
          </ButtonIcon>
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const NavLocationContent = ({ tab }: { tab: Tab }) => {
  return (
    <>{tab.icon ? <tab.icon className="size-4 sm:size-5" /> : tab.label}</>
  );
};
