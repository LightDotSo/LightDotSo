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
import {
  ChevronDown,
  ClipboardCheck,
  Copy,
  Navigation,
  PlusCircle,
  Shuffle,
} from "lucide-react";
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
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ens } = useEnsName({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleCopyClick = useCallback(() => {
    copy(address);
    toast.success("Copied to clipboard!");
  }, [address, copy]);

  const handleDepositClick = useCallback(() => {
    router.push(`/${address}/deposit/new`);
  }, [address, router]);

  const handleSendClick = useCallback(() => {
    router.push(`/${address}/send/new`);
  }, [address, router]);

  const handleSwapClick = useCallback(() => {
    router.push(`/${address}/swap/new`);
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
      <div className="p-1">
        <div className="flex items-center space-x-3 overflow-hidden text-ellipsis pr-2 text-left text-sm md:text-base">
          <div className="text-lg font-extrabold tracking-tight md:text-2xl">
            {wallet
              ? wallet.name
              : (ens ??
                (typeof address === "string" && shortenAddress(address)))}
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
                <DropdownMenuItem onClick={handleDepositClick}>
                  <PlusCircle className="mr-1.5 size-4" />
                  <span>Deposit</span>
                  <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleSendClick}>
                  <Navigation className="mr-1.5 size-4" />
                  <span>Send</span>
                  <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleSwapClick}>
                  <Shuffle className="mr-1.5 size-4" />
                  <span>Swap</span>
                  <DropdownMenuShortcut>⇧⌘W</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden w-auto items-center space-x-1.5 rounded-md bg-background-stronger py-1 pl-2 pr-1 md:mt-3 md:inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <>
                <p className="text-xs text-text-weak md:text-sm">
                  {shortenAddress(address)}
                </p>
                <ButtonIcon
                  variant="unstyled"
                  size="xs"
                  className="font-medium text-text-weak"
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
