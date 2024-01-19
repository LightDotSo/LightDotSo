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

import { useAuth } from "@lightdotso/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { FC } from "react";
import type { Address } from "viem";
import { useDisconnect } from "wagmi";
import { useIsMounted } from "@/hooks";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserNav: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();

  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme, setTheme } = useTheme();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, ens } = useAuth();

  // ---------------------------------------------------------------------------
  // Web3Modal
  // ---------------------------------------------------------------------------

  const { open } = useWeb3Modal();

  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { disconnect } = useDisconnect();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the address is empty, return null
  if (!isMounted || !address) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Wallet className="mr-2 size-4" />
          {address
            ? ens ?? shortenAddress(address as Address)
            : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              open({ view: "Account" });
            }}
          >
            Account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              open({ view: "Networks" });
            }}
          >
            Change Networks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => disconnect()}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Change Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/new">New Wallet</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
