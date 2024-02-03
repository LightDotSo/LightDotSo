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

import { useMediaQuery } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import { Button } from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { ConnectKitButton } from "connectkit";
import { Wallet } from "lucide-react";
import type { Address } from "viem";

// From: https://www.rainbowkit.com/docs/custom-connect-button
// Customizes the ConnectKit button to use the UI Button component.

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ConnectButton = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { ens } = useAuth();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ConnectKitButton.Custom>
      {({ isConnecting, show, address }) => {
        return (
          <Button
            disabled={isConnecting}
            size={isDesktop ? "default" : "lg"}
            onClick={show}
          >
            <Wallet className="mr-2 size-4" />
            {address
              ? ens ?? shortenAddress(address as Address)
              : "Connect Wallet"}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
