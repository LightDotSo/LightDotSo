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

import { PlaceholderOrb } from "@lightdotso/elements";
import { useCopy } from "@lightdotso/hooks";
import { useQueryWallet } from "@lightdotso/query";
import {
  Avatar,
  ButtonIcon,
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
  toast,
} from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { useEnsName } from "@lightdotso/wagmi";
import { ChevronDown, ClipboardCheck, Copy, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, type FC } from "react";
import type { Address } from "viem";

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
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [isCopied, copy] = useCopy();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { data: ens } = useEnsName({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleCopyClick = useCallback(() => {
    copy(address);
    toast.success("Copied to clipboard!");
  }, [address, copy]);

  const handleSendClick = useCallback(() => {
    router.push(`/${address}/send/new`);
  }, [address, router]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { wallet } = useQueryWallet({ address: address });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Avatar className="size-10 sm:size-12 md:size-16">
        <PlaceholderOrb address={address ?? "0x"} />
      </Avatar>
      <div className="p-1 pl-1 pr-2">
        <div className="flex items-center space-x-3 overflow-hidden text-ellipsis text-left text-sm md:text-base">
          <div className="text-lg font-extrabold tracking-tight md:text-2xl">
            {wallet
              ? wallet.name
              : ens ?? (typeof address === "string" && shortenAddress(address))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonIcon variant="outline" size="xs">
                <ChevronDown className="size-3" />
              </ButtonIcon>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleCopyClick}>
                  <Copy className="mr-1.5 size-4" />
                  <span>Copy Address</span>
                  <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleSendClick}>
                  <Navigation className="mr-1.5 size-4" />
                  <span>Send</span>
                  <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden w-auto items-center space-x-1.5 rounded-md bg-background-stronger py-1 pl-2 pr-1 md:mt-3 md:inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <>
                <p className="text-xs font-medium text-text-weak md:text-sm">
                  {shortenAddress(address)}
                </p>
                <ButtonIcon
                  variant="unstyled"
                  size="xs"
                  className="text-text-weak"
                  onClick={handleCopyClick}
                >
                  {!isCopied ? (
                    <Copy className="size-4" />
                  ) : (
                    <ClipboardCheck className="size-4" />
                  )}
                </ButtonIcon>
              </>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Address {shortenAddress(address)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
