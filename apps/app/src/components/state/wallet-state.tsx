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

import { useAppGroup } from "@/hooks";
import { useAddressQueryState } from "@lightdotso/nuqs";
import { useAuth } from "@lightdotso/stores";
import { useAccount } from "@lightdotso/wagmi";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { FC } from "react";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletState: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const appGroup = useAppGroup();

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { address } = useAccount();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [addressQueryState] = useAddressQueryState();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setWallet, setIsAddressPath } = useAuth();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Check if the first segment of the pathname is a valid address w/ isAddress
  // If it is, set the auth state's wallet to that address
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (appGroup === "action") {
      if (addressQueryState) {
        if (isAddress(addressQueryState)) {
          setWallet(addressQueryState);
        }
      }
    }

    if (appGroup === "wallet") {
      const segments = pathname.split("/");
      if (segments.length > 1) {
        const maybeAddress = segments[1];
        if (isAddress(maybeAddress)) {
          setIsAddressPath(true);
          setWallet(maybeAddress);
          return;
        }
      }
    }

    setIsAddressPath(false);
  }, [pathname, address, appGroup, addressQueryState, setWallet]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // or return children if there are children to render
  return null;
};
