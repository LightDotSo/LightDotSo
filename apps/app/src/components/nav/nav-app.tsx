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

import { CartBadgeCountButton } from "@/components/cart/cart-badge-count-button";
import { ChainComboDialog } from "@/components/chain/chain-combo-dialog";
import { NavUser } from "@/components/nav/nav-user";
import { useIsMounted, useMediaQuery } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import {
  FeedbackComboDialog,
  MobileAppDrawer,
  NotificationComboDialog,
} from "@lightdotso/templates";
import type { Tab } from "@lightdotso/types";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type NavAppProps = {
  mobile: ReactNode;
  tabs: Tab[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NavApp: FC<NavAppProps> = ({ mobile, tabs }) => {
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
    return <MobileAppDrawer tabs={tabs}>{mobile}</MobileAppDrawer>;
  }

  return (
    <div className="ml-auto hidden items-center space-x-2.5 md:flex">
      {address && (
        <>
          <ChainComboDialog />
          <FeedbackComboDialog />
          <NotificationComboDialog />
          <CartBadgeCountButton />
        </>
      )}
      <NavUser />
    </div>
  );
};
