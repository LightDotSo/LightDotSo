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

// Entire file from: https://github.com/shadcn/ui/blob/ece54dd362a458b056a1e86481518f0193967e82/apps/www/app/examples/dashboard/components/team-switcher.tsx
// License: MIT

"use client";

import { useAppGroup } from "@/hooks";
import { PlaceholderOrb } from "@lightdotso/elements/placeholder-orb";
import { useIsMounted } from "@lightdotso/hooks";
import { useAddressQueryState } from "@lightdotso/nuqs";
import { useQueryWallets } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { ComboDialog } from "@lightdotso/templates/combo-dialog";
import { Avatar } from "@lightdotso/ui/components/avatar";
import { Button } from "@lightdotso/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@lightdotso/ui/components/command";
import type { PopoverTrigger } from "@lightdotso/ui/components/popover";
import { cn } from "@lightdotso/utils";
import {
  CaretSortIcon,
  CheckIcon,
  GridIcon,
  PlusCircledIcon,
  StackIcon,
} from "@radix-ui/react-icons";
import { HomeIcon, WalletIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ComponentPropsWithoutRef, FC, UIEvent } from "react";
import type { Address } from "viem";
import { getAddress } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverTrigger>;
interface WalletSwitcherProps extends PopoverTriggerProps {}

// -----------------------------------------------------------------------------
// Parent Component
// -----------------------------------------------------------------------------

export const WalletSwitcher: FC<WalletSwitcherProps> = ({ className }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <WalletSwitcherButton className={className} />;
};

// -----------------------------------------------------------------------------
// Child Component
// -----------------------------------------------------------------------------

export const WalletSwitcherButton: FC<WalletSwitcherProps> = ({
  className,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();
  const appGroup = useAppGroup();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [open, setOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{
    address: string;
    // biome-ignore lint/style/useNamingConvention: <explanation>
    factory_address: string;
    name: string;
    salt: string;
  }>();
  const [scrollIsAtTop, setScrollIsAtTop] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { wallets, isWalletsLoading } = useQueryWallets({
    address: address as Address,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
  });

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [, setAddressQueryState] = useAddressQueryState();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // If the slug is `/new` or `/wallets`, set the selected wallet to undefined
    if (appGroup === "unauthenticated") {
      setSelectedWallet(undefined);
      return;
    }

    // Get the wallet + wallets query result
    if (wallet && wallets) {
      // Find the selected wallet from the wallets query
      const selectedWallet = wallets.find(
        (queryWallet) => queryWallet.address === getAddress(wallet),
      );

      // If the wallet is not found, set the selected wallet to undefined
      if (!selectedWallet) {
        setSelectedWallet(undefined);
        return;
      }

      // Set the selected wallet
      setSelectedWallet(selectedWallet);
    }
  }, [wallets, address, appGroup]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // From: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/pages/home/featured-works/works/colormap-registry.tsx#L64
  // License: MIT
  // Thank you @fiveoutofnine
  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    // const scrollHeight = target.scrollHeight;
    // const clientHeight = target.clientHeight;

    setScrollIsAtTop(scrollTop < 10);
    // setScrollIsAtBottom(scrollHeight - scrollTop === clientHeight);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the address is empty or is not mounted, don't render
  if (!(isMounted && address) || isWalletsLoading) {
    return null;
  }

  // If there is no wallet, render a button to create a new wallet
  if (!wallets || (wallets && wallets.length === 0)) {
    return (
      <Button
        variant="ghost"
        className={cn("mx-2 justify-start", className)}
        onClick={() => {
          router.push("/new");
        }}
      >
        <PlusCircledIcon className="mr-2 size-5" />
        New Wallet
      </Button>
    );
  }

  return (
    <ComboDialog
      className="ml-24 w-[300px] p-0"
      buttonTrigger={
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a wallet"
          className={cn("mx-2 justify-start", className)}
        >
          {selectedWallet && (
            <>
              <Avatar className="mr-3 size-7">
                {/* <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedWallet.value}.png`}
                    alt={selectedWallet.label}
                  /> */}
                <PlaceholderOrb address={selectedWallet?.address ?? "0x"} />
                {/* <AvatarFallback>SC</AvatarFallback> */}
              </Avatar>
              {selectedWallet?.name}
            </>
          )}
          {!selectedWallet && wallets && wallets.length > 0 && (
            <>
              <StackIcon className="mr-2 size-5" />
              Select a wallet
            </>
          )}
          {selectedWallet && wallets && wallets.length === 0 && (
            <>
              <PlusCircledIcon className="mr-2 size-5" />
              New Wallet
            </>
          )}
          <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      }
    >
      <Command className="bg-transparent">
        <CommandList>
          <CommandInput
            className="bg-transparent"
            placeholder="Search wallet..."
          />
          <CommandEmpty>No wallet found.</CommandEmpty>
        </CommandList>
        <CommandList onScroll={handleScroll}>
          <CommandGroup>
            {/* Negative margins to widen out to full width */}
            <div className="-ml-1 -mr-2 relative">
              <div
                className={cn(
                  "-mt-2 pointer-events-none absolute top-1 left-0 h-14 w-full bg-gradient-to-b from-background to-transparent transition-opacity duration-500",
                  scrollIsAtTop ? "opacity-0" : "opacity-100",
                )}
              />
            </div>
            {selectedWallet && (
              <CommandItem className="text-sm">
                <Avatar className="mr-2 size-5">
                  <PlaceholderOrb address={selectedWallet.address} />
                </Avatar>
                {selectedWallet.name}
                <span className="hidden">{selectedWallet.address}</span>
                <CheckIcon className="ml-auto size-4" />
              </CommandItem>
            )}
            {wallets &&
              typeof wallets !== "undefined" &&
              wallets?.length > 0 &&
              // Filter out the selected wallet
              wallets
                .filter((wallet) => wallet.address !== selectedWallet?.address)
                .map((wallet) => (
                  <CommandItem
                    key={wallet.address}
                    className="text-sm"
                    onSelect={() => {
                      // Set the selected wallet
                      setSelectedWallet(wallet);

                      // If the app group is swap, set the address query state
                      if (appGroup === "action") {
                        setAddressQueryState(wallet.address);
                        setOpen(false);
                        return;
                      }

                      // If the pathname is empty, don't do anything
                      if (!pathname) {
                        return;
                      }

                      // Replace the current wallet address with the new one
                      if (pathname && pathname.split("/").length > 1) {
                        router.push(
                          `${pathname.replace(
                            pathname.split("/")[1],
                            wallet.address,
                          )}`,
                        );
                      }
                    }}
                  >
                    <Avatar className="mr-2 size-5">
                      <PlaceholderOrb address={wallet.address} />
                    </Avatar>
                    {wallet.name}
                    <span className="hidden">{wallet.address}</span>
                  </CommandItem>
                ))}
          </CommandGroup>
        </CommandList>
        <CommandSeparator />
        {appGroup === "action" && (
          <>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  className="text-sm"
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/${wallet}/overview`);
                  }}
                >
                  <WalletIcon className="mr-2 size-5" />
                  My Wallet
                </CommandItem>
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
          </>
        )}
        <CommandList>
          <CommandGroup>
            <CommandItem
              className="text-sm"
              onSelect={() => {
                setOpen(false);
                router.push("/wallets");
              }}
            >
              <GridIcon className="mr-2 size-5" />
              All Wallets
            </CommandItem>
            <CommandItem
              className="text-sm"
              onSelect={() => {
                setOpen(false);
                router.push(`/?ref=address=${address}`);
              }}
            >
              <HomeIcon className="mr-2 size-5" />
              Home
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandSeparator />
        <CommandList>
          <CommandGroup>
            <CommandItem
              className="text-sm"
              onSelect={() => {
                setOpen(false);
                router.push("/new");
              }}
            >
              <PlusCircledIcon className="mr-2 size-5" />
              New Wallet
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </ComboDialog>
  );
};
