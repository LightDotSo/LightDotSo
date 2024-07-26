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

import { WalletOverviewBannerAddress } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-address";
import { WalletOverviewBannerSparkline } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-sparkline";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useIsDemoPathname } from "@lightdotso/hooks";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import Link from "next/link";
import type { FC } from "react";
import type { Address } from "viem";

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

  const isDemo = useIsDemoPathname();

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const DepositButton: FC = () => {
    if (isDemo) {
      return null;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild type="button" className="w-full md:w-28">
              <Link href={`/${address}/deposit`}>
                <PlusCircleIcon className="mr-2 size-5" />
                Deposit
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deposit Assets</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-4 lg:gap-x-8">
      <div className="col-span-2 flex w-full flex-row items-center space-x-3 lg:border-border lg:border-r">
        <WalletOverviewBannerAddress address={address} />
      </div>
      <div className="col-span-1 flex w-full">
        <WalletOverviewBannerSparkline address={address} />
      </div>
      <div className="col-span-2 flex w-full items-center md:col-span-1 md:justify-end">
        <DepositButton />
      </div>
    </div>
  );
};
