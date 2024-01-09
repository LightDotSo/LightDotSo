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

import type { FC } from "react";
import { Suspense } from "react";
import { ChainPopover } from "@/components/chain/chain-popover";
import { FeedbackPopover } from "@/components/feedback/feedback-popover";
import { UserNav } from "@/components/nav/user-nav";
import { ConnectButton } from "@/components/web3/connect-button";
import { useIsMounted, useMediaQuery } from "@/hooks";
import { useAuth } from "@/stores";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AppNav: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();
  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the address is empty, return null
  if (!isMounted || !address) {
    return null;
  }

  if (!isDesktop) {
    return <div className="ml-auto items-center space-x-2.5 md:flex">SM</div>;
  }

  return (
    <div className="ml-auto hidden items-center space-x-2.5 md:flex">
      {/* <Search /> */}
      <Suspense>
        <ChainPopover />
      </Suspense>
      <FeedbackPopover />
      <UserNav />
      <ConnectButton />
    </div>
  );
};
