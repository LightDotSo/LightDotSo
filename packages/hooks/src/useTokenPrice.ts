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

import { useQuerySocketTokenPrice } from "@lightdotso/query";
import { useTokenPrices } from "@lightdotso/stores";
import { useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type UseTokenPriceProps = {
  chainId: number | null;
  tokenAddress: Address | null;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTokenPrice = ({
  chainId,
  tokenAddress,
}: UseTokenPriceProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { getTokenPrice } = useTokenPrices();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { socketTokenPrice } = useQuerySocketTokenPrice({
    address: tokenAddress,
    chainId: chainId,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tokenPrice = useMemo(() => {
    if (!(chainId && tokenAddress)) {
      return null;
    }

    if (socketTokenPrice) {
      return {
        tokenPrice: socketTokenPrice.price,
      };
    }

    return getTokenPrice(chainId, tokenAddress);
  }, [chainId, tokenAddress, getTokenPrice, socketTokenPrice]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    tokenPrice: tokenPrice,
  };
};
