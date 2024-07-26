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

import { useQueryTokenGroup } from "@lightdotso/query";
import type { TokenAmount } from "@lightdotso/types";
import { useMemo } from "react";
import type { Address } from "viem";
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
  // Query
  // ---------------------------------------------------------------------------

  const { tokenGroup } = useQueryTokenGroup({
    id: groupId,
  });

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
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const token: TokenAmount = useMemo(() => {
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
        group: {
          id: groupId,
          tokens: tokenAmounts,
        },
        group_id: groupId ?? "",
        address: tokenAddress ?? "",
        decimals: tokenGroupFirstToken.decimals,
        symbol: tokenGroupFirstToken.symbol,
      };
    }

    if (tokenGroup && chainId === 0 && groupId) {
      return {
        amount: BigInt(0),
        original_amount: 0,
        balance_usd: 0,
        id: `${address}-${chainId}`,
        chain_id: 0,
        group: undefined,
        group_id: groupId,
        address: tokenGroup.address ?? "",
        decimals: tokenGroup.decimals,
        symbol: tokenGroup.symbol,
      };
    }

    return { group_id: tokenGroup?.id, ...tokenAmount };
  }, [tokenAmount, tokenGroup, tokenAmounts, chainId, groupId]);

  const tokens = useMemo(() => {
    if (tokenAmounts && tokenAmounts.length > 0) {
      return tokenAmounts.filter((token) => {
        // Filter amounts that are not zero
        return token.amount > BigInt(0);
      });
    }

    return [];
  }, [tokenAmounts, tokenGroup]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    token: token,
    tokens: tokens,
    tokenAmount: tokenAmount,
    tokenAmounts: tokenAmounts,
    isTokenLoading: isTokenLoading,
  };
};
