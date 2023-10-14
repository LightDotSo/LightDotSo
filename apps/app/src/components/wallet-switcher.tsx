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

import * as React from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
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

const groups = [
  {
    label: "Wallets",
    wallets: [
      {
        label: "Shun Kakinoki",
        value: "personal",
        href: "/0x10DbbE70128929723c1b982e53c51653232e4Ff2",
      },
      {
        label: "Family Wallet",
        value: "family",
        href: "/0x10DbbE70128929723c1b982e53c51653232e4Ff2",
      },
      {
        label: "Monsters Inc.",
        value: "monsters",
        href: "/0x10DbbE70128929723c1b982e53c51653232e4Ff2",
      },
    ],
  },
];

// Entire file from: https://github.com/shadcn/ui/blob/ece54dd362a458b056a1e86481518f0193967e82/apps/www/app/examples/dashboard/components/team-switcher.tsx
// License: MIT

type Wallet = (typeof groups)[number]["wallets"][number];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface WalletSwitcherProps extends PopoverTriggerProps {}

export function WalletSwitcher({
  // eslint-disable-next-line react/prop-types
  className,
}: WalletSwitcherProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [selectedWallet, setSelectedWallet] = React.useState<Wallet>(
    groups[0].wallets[0],
  );
  const router = useRouter();
  const { address } = useAccount();

  // If the address is empty, return null
  if (!address) {
    return null;
  }

  return (
    <>
      <span className="ml-2 mr-1 text-primary/60">/</span>
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
              <PlaceholderOrb address={selectedWallet.href.substring(1)} />
              {/* <AvatarFallback>SC</AvatarFallback> */}
            </Avatar>
            {selectedWallet.label}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-24 w-[300px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search wallet..." />
              <CommandEmpty>No wallet found.</CommandEmpty>
              {groups.map(group => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.wallets.map(wallet => (
                    <CommandItem
                      key={wallet.value}
                      onSelect={() => {
                        setSelectedWallet(wallet);
                        setOpen(false);
                        router.push(wallet.href);
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
                        <PlaceholderOrb address={wallet.href.substring(1)} />
                      </Avatar>
                      {wallet.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedWallet.value === wallet.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
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
