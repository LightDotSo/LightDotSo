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

import { useMemo } from "react";
import { Address } from "viem";
import { useTokenAmount } from "./useTokenAmount";
import { useTokenAmounts } from "./useTokenAmounts";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export type TokenProps = {
  address: Address;
  chainId: number | undefined;
  tokenAddress: Address | undefined;
  groupId: string | undefined;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useToken = ({
  address,
  chainId,
  tokenAddress,
  groupId,
}: TokenProps) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { tokenAmount, isTokenAmountLoading } = useTokenAmount({
    address: address as Address,
    chainId: chainId,
    tokenAddress: tokenAddress,
  });

  const { tokenAmounts } = useTokenAmounts({
    group_id: groupId ?? tokenAmount?.group?.id,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isTokenLoading = useMemo(() => {
    return isTokenAmountLoading;
  }, [isTokenAmountLoading]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const token = useMemo(() => {
    if (tokenAmounts && tokenAmounts.length > 0 && chainId === 0 && groupId) {
      // Return the aggregated token amount
      const tokenAggregatedAmount = tokenAmounts.reduce((prev, current) => {
        return prev + current.amount;
      }, BigInt(0));
      const tokensAggregatedOriginalAmount = tokenAmounts.reduce(
        (prev, current) => {
          return prev + current.original_amount;
        },
        0,
      );
      const tokenAggregatedBalanceUsd = tokenAmounts.reduce((prev, current) => {
        return prev + current.balance_usd;
      }, 0);

      // Get the first token in the group
      const tokenGroupFirstToken = tokenAmounts[0];

      return {
        amount: tokenAggregatedAmount,
        original_amount: tokensAggregatedOriginalAmount,
        balance_usd: tokenAggregatedBalanceUsd,
        id: `${address}-${chainId}`,
        chain_id: 0,
        group_id: groupId ?? "",
        address: tokenAddress ?? "",
        decimals: tokenGroupFirstToken.decimals,
        symbol: tokenGroupFirstToken.symbol,
      };
    }
    return { group_id: "", ...tokenAmount };
  }, [tokenAmount]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    token: token,
    tokenAmount: tokenAmount,
    tokenAmounts: tokenAmounts,
    isTokenLoading: isTokenLoading,
  };
};
