// Copyright 2023-2024 Light, Inc.
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

import { useModals } from "@lightdotso/stores";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import type { Address } from "viem";
import { WalletOverviewBannerAddress } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-address";
import { WalletOverviewBannerSparkline } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-sparkline";

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
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { showDepositModal } = useModals();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-4 lg:gap-x-8">
      <div className="col-span-2 flex w-full flex-row items-center space-x-3 lg:border-r lg:border-border">
        <WalletOverviewBannerAddress address={address} />
      </div>
      <div className="col-span-1 flex w-full">
        <WalletOverviewBannerSparkline address={address} />
      </div>
      <div className="col-span-2 flex w-full items-center md:col-span-1 md:justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                className="w-full md:w-28"
                onClick={showDepositModal}
              >
                <PlusCircleIcon className="mr-2 size-5" />
                Deposit
              </Button>
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
