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

import { useIsMounted } from "@lightdotso/hooks";
import { useMutationAuthLogout } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { useDisconnect, useModal } from "@lightdotso/wagmi";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { FC } from "react";
import type { Address } from "viem";
import deleteCookiesAction from "@/actions/deleteCookiesAction";
import { ConnectButton } from "@/components/web3/connect-button";

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
  // Connectkit
  // ---------------------------------------------------------------------------

  const { setOpen, openSwitchNetworks } = useModal();

  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { disconnect } = useDisconnect();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { logout } = useMutationAuthLogout();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isMounted) {
    return null;
  }

  if (!address) {
    return <ConnectButton />;
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
              setOpen(true);
            }}
          >
            Account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              openSwitchNetworks();
            }}
          >
            Change Networks
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              disconnect();

              deleteCookiesAction();

              await logout();
            }}
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
