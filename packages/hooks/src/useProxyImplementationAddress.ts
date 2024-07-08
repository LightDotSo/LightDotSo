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

import { useStorageAt } from "@lightdotso/wagmi";
import { useMemo } from "react";
import { getAddress, type Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ProxyImplementationAddressProps = {
  address: Address;
  chainId: number;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useProxyImplementationAddress = ({
  address,
  chainId,
}: ProxyImplementationAddressProps) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: implAddressBytes32, isSuccess: isImplAddressBytes32Success } =
    useStorageAt({
      address: address as Address,
      chainId: chainId,
      // The logic address as defined in the 1967 EIP
      // From: https://eips.ethereum.org/EIPS/eip-1967
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const implAddress = useMemo(() => {
    // Don't continue if the impl address is not available or the call failed
    if (!implAddressBytes32 || !isImplAddressBytes32Success) {
      return;
    }

    // Don't continue if the impl address is not the correct length
    if (implAddressBytes32.length !== 66) {
      return;
    }

    // Convert the bytes32 impl address to an address
    return getAddress(`0x${implAddressBytes32.slice(26)}`);
  }, [implAddressBytes32, isImplAddressBytes32Success]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return implAddress;
};
