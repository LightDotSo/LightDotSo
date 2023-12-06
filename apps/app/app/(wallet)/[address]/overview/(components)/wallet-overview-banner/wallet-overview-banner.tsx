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

import { getWallet } from "@lightdotso/client";
import {
  Avatar,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { splitAddress } from "@lightdotso/utils";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import type { FC } from "react";
import type { Address } from "viem";
import { useEnsName } from "wagmi";
import { WalletOverviewBannerSparkline } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner-sparkline";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { WalletData } from "@/data";
import { queries } from "@/queries";
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
  const { data: ens } = useEnsName({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletData | undefined = queryClient.getQueryData(
    queries.wallet.get(address).queryKey,
  );

  const { data: wallet } = useSuspenseQuery<WalletData | null>({
    queryKey: queries.wallet.get(address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWallet({
        params: {
          query: {
            address: address,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-4 lg:gap-x-4">
        <div className="col-span-2 flex w-full flex-row items-center space-x-5 lg:border-r lg:border-border">
          <Avatar className="h-16 w-16">
            <PlaceholderOrb address={address ?? "0x"} />
          </Avatar>
          <div className="flex justify-start overflow-hidden text-ellipsis text-left text-2xl font-extrabold tracking-tight text-text">
            {wallet
              ? wallet.name
              : ens ?? (typeof address === "string" && splitAddress(address))}
          </div>
        </div>
        <div className="col-span-1 flex w-full">
          <Suspense fallback={null}>
            <WalletOverviewBannerSparkline address={address} />
          </Suspense>
        </div>
        <div className="col-span-1 flex w-full items-center justify-end">
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
        </div>
      </div>
    </TooltipProvider>
  );
};
