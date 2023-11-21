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
  Avatar,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import type { Address } from "viem";
import { splitAddress } from "@lightdotso/utils";
import { useCopy } from "@/hooks/useCopy";
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Send, Share } from "lucide-react";
import { useEnsName } from "wagmi";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { getWallet } from "@lightdotso/client";
import { WalletOverviewBannerSparkline } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner-sparkline";
import type { FC } from "react";
import { Suspense } from "react";
import { NetworkStack } from "@/components/network/network-stack";
import { queries } from "@/queries";
import type { WalletData } from "@/data";
import Link from "next/link";

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
  const [isCopied, copy] = useCopy();
  const { data: ens } = useEnsName({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: WalletData | undefined = useQueryClient().getQueryData(
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
      <div className="flex flex-col justify-start sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-row items-center space-x-5">
          <Avatar className="h-20 w-20">
            <PlaceholderOrb address={address ?? "0x"} />
          </Avatar>
          <div className="space-y-4 sm:mt-6 md:mt-0 md:space-y-6 md:pl-4">
            <div className="flex w-full flex-row items-center justify-start space-x-4">
              <div className="flex flex-col space-y-5 sm:mx-0 sm:max-w-xl">
                <h2 className="flex justify-start overflow-hidden text-ellipsis text-left text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
                  {wallet
                    ? wallet.name
                    : ens ??
                      (typeof address === "string" && splitAddress(address))}
                </h2>
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      className="flex items-center rounded-md bg-background-stronger px-3 py-2"
                      onClick={() => {
                        return copy(address);
                      }}
                    >
                      <p className="mr-2 text-sm text-text-weak">
                        {ens ?? splitAddress(address)}
                      </p>
                      {!isCopied ? (
                        <ClipboardDocumentIcon className="h-4 w-4 text-text-weak" />
                      ) : (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-text-weak" />
                      )}
                    </button>
                    <TooltipContent>
                      <p>Copy Wallet Address</p>
                    </TooltipContent>
                  </TooltipTrigger>
                </Tooltip>
                <div className="flex justify-start">
                  <NetworkStack address={address} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="mt-4 flex items-center justify-end gap-x-2 lg:mt-0">
            <Button size="sm" className="rounded-full p-3" variant="outline">
              <Share className="h-3 w-3" />
              <span className="sr-only">Open share modal</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full p-3"
              variant="outline"
            >
              <Link href={`/${address}/send`}>
                <Send className="h-3 w-3" />
                <span className="sr-only">Open send</span>
              </Link>
            </Button>
            <Button
              size="sm"
              type="button"
              className="w-full md:w-24"
              onClick={() => {}}
            >
              Deposit
            </Button>
          </div>
          <div className="w-96 rounded-md border border-border-primary-weak bg-background-weak px-6 py-4">
            <Suspense fallback={null}>
              <WalletOverviewBannerSparkline address={address} />
            </Suspense>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
