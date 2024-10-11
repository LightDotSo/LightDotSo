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

import { HOME_TABS } from "@/const/tabs";
import { INTERNAL_LINKS } from "@lightdotso/const";
import { LightHorizontalLogo } from "@lightdotso/svg";
import { NavLocation } from "@lightdotso/templates/nav";
import { Button } from "@lightdotso/ui/components/button";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import { Menu } from "./menu";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Header: FC = () => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [hasScrolled, setHasScrolled] = useState(false);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "sticky top-0 z-50 bg-background-body bg-opacity-95",
        hasScrolled && "border-border-weak border-b",
      )}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex h-16 items-center justify-between px-2 py-1">
          <Link
            href="/"
            className="p-2 hover:rounded-md hover:bg-background-stronger"
          >
            <LightHorizontalLogo className="h-8 shrink-0" />
          </Link>
          <div className="relative z-10 hidden sm:block">
            <Menu />
          </div>
          <NavLocation tabs={HOME_TABS} isTabsVisibleDesktop={false}>
            <Button asChild>
              <a href={INTERNAL_LINKS.Intro}>Launch App</a>
            </Button>
          </NavLocation>
        </div>
      </div>
    </div>
  );
};
