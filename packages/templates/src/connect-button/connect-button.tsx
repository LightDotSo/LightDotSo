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

import { useMediaQuery } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import { Button } from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { ConnectKitButton } from "@lightdotso/wagmi";
import { Wallet } from "lucide-react";
import type { FC } from "react";
import type { Address } from "viem";

// From: https://www.rainbowkit.com/docs/custom-connect-button
// Customizes the ConnectKit button to use the UI Button component.

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ConnectButton: FC = () => {
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
