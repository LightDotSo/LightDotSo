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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { splitAddress } from "@lightdotso/utils";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Copy } from "lucide-react";
import { useCallback, type FC } from "react";
import type { Address } from "viem";
import { useEnsName } from "wagmi";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { WalletData } from "@/data";
import { useCopy } from "@/hooks/useCopy";
import { queries } from "@/queries";
import { successToast } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface WalletOverviewBannerAddressProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletOverviewBannerAddress: FC<
  WalletOverviewBannerAddressProps
> = ({ address }) => {
  const { data: ens } = useEnsName({
    address: address,
  });
  const [, copy] = useCopy();

  const handleAddressClick = useCallback(() => {
    copy(address);
    successToast("Copied to clipboard");
  }, [address, copy]);

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
      <Avatar className="h-16 w-16">
        <PlaceholderOrb address={address ?? "0x"} />
      </Avatar>
      <div className="flex justify-start space-x-3 overflow-hidden text-ellipsis py-1 pl-1 pr-3 text-left">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="unstyled"
              size="unsized"
              className="text-2xl font-extrabold tracking-tight"
              onClick={handleAddressClick}
            >
              {wallet
                ? wallet.name
                : ens ?? (typeof address === "string" && splitAddress(address))}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy Address {splitAddress(address)}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="m-1 px-2" size="unsized" variant="outline">
              <ChevronDown className="h-3- w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAddressClick}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Address</span>
                <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};
