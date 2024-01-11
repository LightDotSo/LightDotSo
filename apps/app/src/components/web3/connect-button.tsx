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

import { Button } from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import type { Address } from "viem";

// From:https://www.rainbowkit.com/docs/custom-connect-button
// Customizes the ConnectKit button to use the UI Button component.

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ConnectButton = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <RainbowConnectButton.Custom>
      {({ account, mounted, openConnectModal }) => {
        return (
          <Button size="sm" isLoading={!mounted} onClick={openConnectModal}>
            <Wallet className="mr-2 h-4 w-4" />
            {account
              ? account.ensName ?? shortenAddress(account.address as Address)
              : "Connect Wallet"}
          </Button>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
