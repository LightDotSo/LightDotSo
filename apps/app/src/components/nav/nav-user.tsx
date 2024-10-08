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

import deleteCookiesAction from "@/actions/deleteCookiesAction";
import { useIsMounted } from "@lightdotso/hooks";
import { useMutationAuthLogout } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { ConnectButton } from "@lightdotso/templates/connect-button";
import { Button } from "@lightdotso/ui/components/button";
import {
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
} from "@lightdotso/ui/components/dropdown-menu";
import { toast } from "@lightdotso/ui/components/toast";
import { shortenAddress } from "@lightdotso/utils";
import { useModal } from "@lightdotso/wagmi/connectkit";
import {
  cookieStorage,
  createStorage,
  useDisconnect,
} from "@lightdotso/wagmi/wagmi";
import { Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NavUser: FC = () => {
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
  // Wagmi
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
        <Button>
          <Wallet className="mr-2 size-4" />
          {address
            ? (ens ?? shortenAddress(address as Address))
            : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent forceMount className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                <DropdownMenuItem
                  onClick={() => toast.error("Not implemented yet.")}
                >
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.error("Not implemented yet.")}
                >
                  Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toast.error("Not implemented yet.")}
                >
                  More...
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/notifications">
              Notifications <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/new">New Wallet</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              // Disconnect
              disconnect();

              // Clear cookies on client
              const cookies = createStorage({
                storage: cookieStorage,
              });
              cookies.removeItem("state");
              cookies.removeItem("recentConnectorId");

              // Clear cookies on server
              deleteCookiesAction();

              // Logout
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
