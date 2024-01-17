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
import { RawTab } from "@lightdotso/types";
import { MobileAppDrawer } from "@lightdotso/ui";
import type { FC } from "react";
import { Suspense } from "react";
import { ChainPopover } from "@/components/chain/chain-popover";
import { FeedbackPopover } from "@/components/feedback/feedback-popover";
import { UserNav } from "@/components/nav/user-nav";
import { ConnectButton } from "@/components/web3/connect-button";
import { useIsMounted, useMediaQuery } from "@/hooks";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type AppNavProps = {
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
    return <MobileAppDrawer tabs={tabs} />;
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
