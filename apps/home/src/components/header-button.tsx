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

// From: https://magicui.design/docs/components/retro-grid
// From: https://github.com/magicuidesign/magicui/blob/5ade13d309644c18ed29b2573d7abb7d6003df48/registry/components/magicui/retro-grid.tsx
// License: MIT

"use client";

import { HOME_TABS } from "@/const/tabs";
import { INTERNAL_LINKS } from "@lightdotso/const";
import { useMediaQuery } from "@lightdotso/hooks";
import { MobileAppDrawer } from "@lightdotso/templates/mobile-app-drawer";
import { Button } from "@lightdotso/ui/components/button";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const HeaderButton: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isDesktop) {
    return (
      <MobileAppDrawer tabs={HOME_TABS}>
        <Button asChild>
          <Link href={INTERNAL_LINKS.App}>Launch App</Link>
        </Button>
      </MobileAppDrawer>
    );
  }

  return (
    <Button asChild>
      <Link href={INTERNAL_LINKS.App}>Launch App</Link>
    </Button>
  );
};
