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

import type { TokenData } from "@lightdotso/data";
import { useQueryToken } from "@lightdotso/query";
import type { TokenAmount } from "@lightdotso/types";
import { useMemo } from "react";
import type { Address } from "viem";
import { type WagmiToken, useWagmiToken } from "./useWagmiToken";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export type TokenAmountProps = {
  address: Address | null | undefined;
  chainId: number | undefined;
  tokenAddress: Address | undefined;
  groupId?: string | undefined;
};

export const useTokenAmount = ({
  address,
  chainId,
  tokenAddress,
}: TokenAmountProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token: queryToken, isTokenLoading: isQueryTokenLoading } =
    useQueryToken({
      address: (tokenAddress as Address) ?? undefined,
      chain_id: chainId,
      wallet: address as Address,
    });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    wagmiToken: fromWagmiToken,
    isWagmiTokenLoading: isFromWagmiTokenLoading,
  } = useWagmiToken({
    address: address as Address,
    chainId: chainId,
    tokenAddress: tokenAddress,
  });

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  function getSwapToken(
    queryToken: TokenData | null | undefined,
    wagmiToken: WagmiToken | null | undefined,
  ) {
    const fromSwapToken: TokenAmount = {
      amount: queryToken?.amount ? BigInt(queryToken.amount) : BigInt(0),
      original_amount: queryToken?.amount ?? 0,
      balance_usd: queryToken?.balance_usd ?? 0,
      id: queryToken?.id ?? `${address}-${chainId}`,
      chain_id: chainId ?? queryToken?.chain_id ?? 0,
      address: tokenAddress ?? queryToken?.address ?? "",
      decimals: queryToken?.decimals ?? 0,
      symbol: queryToken?.symbol ?? "",
      group: queryToken?.group
        ? { id: queryToken?.group?.id ?? "", tokens: [] }
        : undefined,
    };

    if (wagmiToken?.balance) {
      fromSwapToken.amount = wagmiToken?.balance;
    }

    if (wagmiToken?.decimals) {
      fromSwapToken.decimals = wagmiToken?.decimals;
    }

    if (wagmiToken?.symbol) {
      fromSwapToken.symbol = wagmiToken?.symbol;
    }

    return fromSwapToken;
  }

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const tokenAmount: TokenAmount | null = useMemo(() => {
    return getSwapToken(queryToken, fromWagmiToken);
  }, [queryToken, fromWagmiToken]);

  const isTokenAmountLoading = useMemo(() => {
    return isQueryTokenLoading || isFromWagmiTokenLoading;
  }, [isQueryTokenLoading, isFromWagmiTokenLoading]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    tokenAmount: tokenAmount,
    isTokenAmountLoading: isTokenAmountLoading,
  };
};
