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

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import type { FC } from "react";
import type { Address } from "viem";
import { WalletOverviewBannerAddress } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-address";
import { WalletOverviewBannerSparkline } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-sparkline";
import { errorToast } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface WalletOverviewBannerProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletOverviewBanner: FC<WalletOverviewBannerProps> = ({
  address,
}) => {
  return (
    <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-4 lg:gap-x-8">
      <div className="col-span-2 flex w-full flex-row items-center space-x-3 lg:border-r lg:border-border">
        <WalletOverviewBannerAddress address={address} />
      </div>
      <div className="col-span-1 flex w-full">
        <Suspense fallback={null}>
          <WalletOverviewBannerSparkline address={address} />
        </Suspense>
      </div>
      <div className="col-span-1 flex w-full items-center justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  type="button"
                  className="w-full md:w-28"
                  onClick={() => {
                    errorToast("Not implemented yet");
                  }}
                >
                  <PlusCircleIcon className="mr-2 h-5 w-5" />
                  Deposit
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Deposit Assets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
