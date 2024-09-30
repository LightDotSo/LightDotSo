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

import { useQueryWallet } from "@lightdotso/query";
import {
  isEntryPointV06LightWalletFactory,
  isEntryPointV06LightWalletFactoryImplementation,
  isEntryPointV07LightWalletFactory,
  isEntryPointV07LightWalletFactoryImplementation,
} from "@lightdotso/sdk";
import { useMemo } from "react";
import type { Address } from "viem";
import { useProxyImplementationAddress } from "./useProxyImplementationAddress";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type EntryPointVersionProps = {
  address: Address;
  chainId: number | null;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useEntryPointVersion = ({
  address,
  chainId,
}: EntryPointVersionProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { wallet } = useQueryWallet({ address: address as Address });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const implementationAddress = useProxyImplementationAddress({
    address: address as Address,
    chainId: Number(chainId),
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isEntryPointV06 = useMemo(() => {
    if (!implementationAddress) {
      return isEntryPointV06LightWalletFactory(
        wallet?.factory_address as Address | undefined,
      );
    }

    return isEntryPointV06LightWalletFactoryImplementation(
      implementationAddress,
    );
  }, [wallet?.factory_address, implementationAddress]);

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isEntryPointV06", isEntryPointV06);

  const isEntryPointV07 = useMemo(() => {
    if (!implementationAddress) {
      return isEntryPointV07LightWalletFactory(
        wallet?.factory_address as Address | undefined,
      );
    }

    return isEntryPointV07LightWalletFactoryImplementation(
      implementationAddress,
    );
  }, [wallet?.factory_address, implementationAddress]);

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isEntryPointV07", isEntryPointV07);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    version: isEntryPointV06 ? "0.6" : isEntryPointV07 ? "0.7" : null,
    isEntryPointV06: isEntryPointV06,
    isEntryPointV07: isEntryPointV07,
  };
};
