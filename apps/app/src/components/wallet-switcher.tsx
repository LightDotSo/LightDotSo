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

// Entire file from: https://github.com/shadcn/ui/blob/ece54dd362a458b056a1e86481518f0193967e82/apps/www/app/examples/dashboard/components/team-switcher.tsx
// License: MIT

"use client";

import type { UIEvent, FC } from "react";
import { Suspense, useEffect, useState } from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
  StackIcon,
} from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Skeleton,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { PlaceholderOrb } from "./placeholder-orb";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { getWallets } from "@lightdotso/client";
import { useAuth } from "@/stores/useAuth";
import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import { queries } from "@/queries";
import type { WalletData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;
interface WalletSwitcherProps extends PopoverTriggerProps {}

// -----------------------------------------------------------------------------
// Parent Component
// -----------------------------------------------------------------------------

export const WalletSwitcher: FC<WalletSwitcherProps> = ({
  // eslint-disable-next-line react/prop-types
  className,
}) => {
  return (
    <Suspense fallback={<Skeleton className="mx-2 h-8 w-32"></Skeleton>}>
      <WalletSwitcherButton className={className} />
    </Suspense>
  );
};

// -----------------------------------------------------------------------------
// Child Component
// -----------------------------------------------------------------------------

export const WalletSwitcherButton: FC<WalletSwitcherProps> = ({
  // eslint-disable-next-line react/prop-types
  className,
}) => {
  const isMounted = useIsMounted();
  const [open, setOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{
    address: string;
    factory_address: string;
    name: string;
    salt: string;
  }>();
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useAuth();

  const [scrollIsAtTop, setScrollIsAtTop] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: WalletData[] | undefined = useQueryClient().getQueryData(
    queries.wallet.list(address as Address).queryKey,
  );

  const { data, isLoading } = useSuspenseQuery<WalletData[] | null>({
    queryKey: queries.wallet.list(address as Address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWallets({
        params: {
          query: {
            owner: address,
            limit: 300,
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

  useEffect(() => {
    if (data && pathname && pathname.split("/").length > 1) {
      // Get the slug of the path and find the wallet
      // ex) /0x1234 -> 0x1234
      const slug = pathname.split("/")[1];

      // If the slug is not an address, return
      if (!isAddress(slug)) {
        return;
      }

      // Find the wallet from the slug
      const wallet = data.find(wallet => wallet.address === getAddress(slug));

      // If there is no wallet, set the first wallet as the selected wallet
      if (!wallet) {
        setSelectedWallet(data[0]);
        return;
      }

      setSelectedWallet(wallet);
    }
  }, [data, address, pathname]);

  // From: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/pages/home/featured-works/works/colormap-registry.tsx#L64
  // License: MIT
  // Thank you @fiveoutofnine
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    // const scrollHeight = target.scrollHeight;
    // const clientHeight = target.clientHeight;

    setScrollIsAtTop(scrollTop < 10);
    // setScrollIsAtBottom(scrollHeight - scrollTop === clientHeight);
  };

  // If the address is empty or is not mounted, don't render
  if (!isMounted || !address || isLoading) {
    return null;
  }

  // If there is no wallet, render a button to create a new wallet
  if (!data) {
    return (
      <Button
        variant="ghost"
        className={cn("mx-2 justify-start", className)}
        onClick={() => {
          router.push("/new");
        }}
      >
        <PlusCircledIcon className="mr-2 h-5 w-5" />
        New Wallet
      </Button>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a wallet"
            className={cn("mx-2 justify-start", className)}
          >
            {selectedWallet && (
              <>
                <Avatar className="mr-3 h-7 w-7">
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
            {!selectedWallet && data && data.length > 0 && (
              <>
                <StackIcon className="mr-2 h-5 w-5" />
                Select a wallet
              </>
            )}
            {selectedWallet && data && data.length === 0 && (
              <>
                <PlusCircledIcon className="mr-2 h-5 w-5" />
                New Wallet
              </>
            )}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-24 w-[300px] p-0">
          <Command>
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
                <div className="relative -ml-1 -mr-2">
                  <div
                    className={cn(
                      "pointer-events-none absolute -mt-2 top-1 left-0 h-14 w-full bg-gradient-to-b from-muted to-transparent transition-opacity duration-500",
                      scrollIsAtTop ? "opacity-0" : "opacity-100",
                    )}
                  />
                </div>
                {selectedWallet && (
                  <CommandItem className="text-sm">
                    <Avatar className="mr-2 h-5 w-5">
                      <PlaceholderOrb address={selectedWallet.address} />
                    </Avatar>
                    {selectedWallet.name}
                    <span className="hidden">{selectedWallet.address}</span>
                    <CheckIcon className="ml-auto h-4 w-4" />
                  </CommandItem>
                )}
                {data &&
                  // Filter out the selected wallet
                  data
                    .filter(
                      wallet => wallet.address !== selectedWallet?.address,
                    )
                    .map(wallet => (
                      <CommandItem
                        key={wallet.address}
                        onSelect={() => {
                          setSelectedWallet(wallet);
                          setOpen(false);
                          // Replace the current wallet address with the new one
                          if (!pathname) return;
                          if (pathname && pathname.split("/").length > 1) {
                            router.push(
                              `${pathname.replace(
                                pathname.split("/")[1],
                                wallet.address,
                              )}
                                `,
                            );
                          }
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          {/* <AvatarImage
                        src={`https://avatar.vercel.sh/${wallet.value}.png`}
                        alt={wallet.label}
                        className="grayscale"
                      />
                      <AvatarFallback>SC</AvatarFallback> */}
                          <PlaceholderOrb address={wallet.address} />
                        </Avatar>
                        {wallet.name}
                        <span className="hidden">{wallet.address}</span>
                      </CommandItem>
                    ))}
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
                  <PlusCircledIcon className="mr-2 h-5 w-5" />
                  New Wallet
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};
