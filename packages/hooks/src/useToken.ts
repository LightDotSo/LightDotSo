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
import { useMemo } from "react";
import { Address } from "viem";
import { TokenAmountData, useTokenAmount } from "./useTokenAmount";
import { useTokenAmounts } from "./useTokenAmounts";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type TokenBaseData = TokenAmountData & {
  group_id: string;
};

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

  const token: TokenBaseData = useMemo(() => {
    // if (tokenGroupTokens && tokenGroupTokens.length > 0) {
    //   // Return the aggregated token amount
    //   const tokenAggregatedAmount = tokenAmounts.reduce((prev, current) => {
    //     return prev + current.tokenAmount.amount;
    //   }, BigInt(0));
    //   const tokensAggregatedOriginalAmount = tokenAmounts.reduce(
    //     (prev, current) => {
    //       return prev + current.tokenAmount.original_amount;
    //     },
    //     0,
    //   );
    //   const tokenAggregatedBalanceUsd = tokenAmounts.reduce((prev, current) => {
    //     return prev + current.tokenAmount.balance_usd;
    //   }, 0);

    //   // Get the first token in the group
    //   const tokenGroupFirstToken = tokenGroupTokens[0];

    //   return {
    //     amount: tokenAggregatedAmount,
    //     original_amount: tokensAggregatedOriginalAmount,
    //     balance_usd: tokenAggregatedBalanceUsd,
    //     id: `${address}-${chainId}`,
    //     chain_id: 0,
    //     group_id: groupId ?? "",
    //     address: tokenAddress ?? "",
    //     decimals: tokenGroupFirstToken.decimals,
    //     symbol: tokenGroupFirstToken.symbol,
    //   };
    // }
    return { group_id: "", ...tokenAmount };
    // }, [tokenAmount, tokenAmounts]);
  }, [tokenAmount]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    token: token,
    tokenAmount: tokenAmount,
    isTokenLoading: isTokenLoading,
  };
};
