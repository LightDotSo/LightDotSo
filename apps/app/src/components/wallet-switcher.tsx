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

import { useEffect, useState } from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import {
  cn,
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
} from "@lightdotso/ui";
import { PlaceholderOrb } from "./placeholder-orb";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@lightdotso/client";
import { useAuth } from "@/stores/useAuth";

// Entire file from: https://github.com/shadcn/ui/blob/ece54dd362a458b056a1e86481518f0193967e82/apps/www/app/examples/dashboard/components/team-switcher.tsx
// License: MIT

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface WalletSwitcherProps extends PopoverTriggerProps {}

export function WalletSwitcher({
  // eslint-disable-next-line react/prop-types
  className,
}: WalletSwitcherProps) {
  const isMounted = useIsMounted();
  const [open, setOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{
    address: string;
    factory_address: string;
    id: string;
    name: string;
    salt: string;
  }>();
  const router = useRouter();
  const { address } = useAuth();

  const { data } = useQuery({
    enabled: !!address,
    queryKey: ["wallets", address],
    queryFn: async () => {
      const res = await getWallets({
        params: {
          query: {
            owner: address,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data?.data;
        },
        err => {
          console.error(err);
          return null;
        },
      );
    },
  });

  useEffect(() => {
    if (data) {
      // Get the first wallet
      const wallet = data[0];

      setSelectedWallet(wallet);
    }
  }, [data, address]);

  // If the address is empty or is not mounted, don't render
  if (!isMounted || !address) {
    return null;
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
            <Avatar className="mr-3 h-7 w-7">
              {/* <AvatarImage
              src={`https://avatar.vercel.sh/${selectedWallet.value}.png`}
              alt={selectedWallet.label}
            /> */}
              <PlaceholderOrb address={selectedWallet?.address ?? "0x"} />
              {/* <AvatarFallback>SC</AvatarFallback> */}
            </Avatar>
            {selectedWallet?.name}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-24 w-[300px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search wallet..." />
              <CommandEmpty>No wallet found.</CommandEmpty>
              <CommandGroup>
                {data &&
                  data.map(wallet => (
                    <CommandItem
                      key={wallet.id}
                      onSelect={() => {
                        setSelectedWallet(wallet);
                        setOpen(false);
                        router.push(`/${wallet.address}`);
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
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedWallet?.address === wallet.address
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
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
}
