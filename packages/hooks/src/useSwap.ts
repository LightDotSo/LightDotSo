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

import { useIsFetchingLifiQuote } from "@lightdotso/query";
import type { Swap } from "@lightdotso/schemas";
import { useAuth, useUserOperations } from "@lightdotso/stores";
import { useEffect, useMemo } from "react";
import { type Address } from "viem";
import { useDebouncedValue } from "./useDebouncedValue";
import { useToken } from "./useToken";
import { useQuote } from "./useQuote";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export type SwapProps = {
  fromSwap: Swap | undefined;
  toSwap: Swap | undefined;
};

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useSwap = ({ fromSwap, toSwap }: SwapProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { setExecutionParamsByChainId } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    token: fromToken,
    tokens: fromTokens,
    isTokenLoading: isFromTokenLoading,
  } = useToken({
    address: wallet as Address,
    chainId: fromSwap?.chainId,
    tokenAddress: fromSwap?.address as Address,
    groupId: fromSwap?.groupId,
  });

  const { token: toToken, isTokenLoading: isToTokenLoading } = useToken({
    address: wallet as Address,
    chainId: toSwap?.chainId,
    tokenAddress: toSwap?.address as Address,
    groupId: toSwap?.groupId,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const fromSwapDecimals = useMemo(() => {
    return fromToken?.decimals;
  }, [fromToken?.decimals]);

  const toSwapDecimals = useMemo(() => {
    return toToken?.decimals;
  }, [toToken?.decimals]);

  const fromSwapMaximumAmount = useMemo(() => {
    return fromToken?.amount;
  }, [fromToken?.amount]);

  const toSwapMaximumAmount = useMemo(() => {
    return toToken?.amount;
  }, [toToken?.amount]);

  const fromSwapMaximumQuantity = useMemo(() => {
    if (fromSwapMaximumAmount && fromSwapDecimals) {
      return Number(fromSwapMaximumAmount) / Math.pow(10, fromSwapDecimals);
    }
    return null;
  }, [fromSwapMaximumAmount, fromSwapDecimals]);

  const toSwapMaximumQuantity = useMemo(() => {
    if (toSwapMaximumAmount && toSwapDecimals) {
      return Number(toSwapMaximumAmount) / Math.pow(10, toSwapDecimals);
    }
    return null;
  }, [toSwapMaximumAmount, toSwapDecimals]);

  const fromSwapAmount = useMemo(() => {
    if (
      fromSwap &&
      fromSwap?.quantity &&
      fromSwapDecimals &&
      fromSwapMaximumAmount &&
      fromSwapMaximumQuantity
    ) {
      // If amount is same as maximum amount, return the amount
      if (fromSwap?.quantity === fromSwapMaximumQuantity) {
        return fromSwapMaximumAmount;
      }

      // If amount ends in floating point, return the amount without floating point
      const swapAmount = BigInt(
        Math.floor(fromSwap?.quantity * Math.pow(10, fromSwapDecimals)),
      );

      // If swap amount is less than or equal to the buy token amount, return the swap amount
      if (swapAmount <= fromSwapMaximumAmount) {
        return swapAmount;
      } else {
        return fromSwapMaximumAmount;
      }
    }
    return null;
  }, [
    fromSwap,
    fromSwap?.quantity,
    fromSwapDecimals,
    fromSwapMaximumAmount,
    fromSwapMaximumQuantity,
  ]);

  const fromTokenDollarRatio = useMemo(() => {
    return fromToken?.balance_usd && fromToken?.amount && fromSwapDecimals
      ? fromToken?.balance_usd /
          (Number(fromToken?.original_amount) / Math.pow(10, fromSwapDecimals))
      : null;
  }, [fromToken?.balance_usd, fromToken?.original_amount, fromSwapDecimals]);

  const toTokenDollarRatio = useMemo(() => {
    return toToken?.balance_usd && toToken?.amount && toSwapDecimals
      ? toToken?.balance_usd /
          (Number(toToken?.original_amount) / Math.pow(10, toSwapDecimals))
      : null;
  }, [toToken?.balance_usd, toToken?.original_amount, toSwapDecimals]);

  const fromSwapQuantityDollarValue = useMemo(() => {
    return fromSwap?.quantity && fromTokenDollarRatio
      ? fromSwap?.quantity * fromTokenDollarRatio
      : null;
  }, [fromSwap?.quantity, fromTokenDollarRatio]);

  const toSwapQuantityDollarValue = useMemo(() => {
    return toSwap?.quantity && toTokenDollarRatio
      ? toSwap?.quantity * toTokenDollarRatio
      : null;
  }, [toSwap?.quantity, toTokenDollarRatio]);

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const [debouncedFromSwapAmount] = useDebouncedValue(fromSwapAmount, 800);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    quote,
    toQuotedAmount: toSwapQuotedAmount,
    executionParams,
    isQuoteLoading,
  } = useQuote({
    fromAddress: wallet as Address,
    fromChainId: fromSwap?.chainId,
    fromTokenAddress: fromSwap?.address as Address,
    fromAmount: debouncedFromSwapAmount ?? undefined,
    toAddress: wallet as Address,
    toChainId: toSwap?.chainId,
    toTokenAddress: toSwap?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const toSwapQuotedQuantity = useMemo(() => {
    if (toSwapQuotedAmount && toSwapDecimals) {
      return Number(toSwapQuotedAmount) / Math.pow(10, toSwapDecimals);
    }
    return null;
  }, [toSwapQuotedAmount, toSwapDecimals]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const isFetchingLifiQuoteNumber = useIsFetchingLifiQuote();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (executionParams && executionParams.length > 0) {
      setExecutionParamsByChainId(executionParams[0].chainId, executionParams);
    }
  }, [executionParams]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFromSwapValueValid = useMemo(() => {
    return (
      fromSwap?.quantity &&
      fromSwapMaximumQuantity &&
      fromSwap?.quantity > 0 &&
      fromSwap?.quantity <= fromSwapMaximumQuantity
    );
  }, [fromSwap?.quantity, fromSwapMaximumQuantity]);

  const isFromSwapLoading = useMemo(() => {
    return isFromTokenLoading;
  }, [isFromTokenLoading]);

  const isToSwapLoading = useMemo(() => {
    return isFromTokenLoading || isToTokenLoading || isQuoteLoading;
  }, [isFromTokenLoading, isToTokenLoading, isQuoteLoading]);

  const isSwapNotEmpty = useMemo(() => {
    return fromSwap?.quantity && toSwap?.quantity;
  }, [fromSwap?.quantity, toSwap?.quantity]);

  const isSwapLoading = useMemo(() => {
    return (
      isFromTokenLoading ||
      isToTokenLoading ||
      isQuoteLoading ||
      // For grouped tokens with chainId 0, we need to check if we are fetching lifi quote
      (fromSwap?.chainId === 0 && isFetchingLifiQuoteNumber > 0)
    );
  }, [
    isFromTokenLoading,
    isToTokenLoading,
    isQuoteLoading,
    fromSwap?.chainId,
    isFetchingLifiQuoteNumber,
  ]);

  const isSwapValid = useMemo(() => {
    return isFromSwapValueValid && isSwapNotEmpty;
  }, [isFromSwapValueValid, isSwapNotEmpty]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    quote: quote,
    fromToken: fromToken,
    isFromTokenLoading: isFromTokenLoading,
    fromTokens: fromTokens,
    toToken: toToken,
    isToTokenLoading: isToTokenLoading,
    fromSwapAmount: debouncedFromSwapAmount,
    toSwapQuotedAmount: toSwapQuotedAmount,
    toSwapQuotedQuantity: toSwapQuotedQuantity,
    isFromSwapLoading: isFromSwapLoading,
    isToSwapLoading: isToSwapLoading,
    isSwapLoading: isSwapLoading,
    isFromSwapValueValid: isFromSwapValueValid,
    isSwapValid: isSwapValid,
    fromSwapMaximumAmount: fromSwapMaximumAmount,
    toSwapMaximumAmount: toSwapMaximumAmount,
    executionParams: executionParams,
    fromSwapDecimals: fromSwapDecimals,
    toSwapDecimals: toSwapDecimals,
    fromTokenDollarRatio: fromTokenDollarRatio,
    toTokenDollarRatio: toTokenDollarRatio,
    fromSwapQuantityDollarValue: fromSwapQuantityDollarValue,
    toSwapQuantityDollarValue: toSwapQuantityDollarValue,
    fromSwapMaximumQuantity: fromSwapMaximumQuantity,
    toSwapMaximumQuantity: toSwapMaximumQuantity,
  };
};
