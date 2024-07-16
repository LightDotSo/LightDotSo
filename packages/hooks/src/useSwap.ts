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

import { TokenData } from "@lightdotso/data";
import { useQueryLifiQuote, useQueryToken } from "@lightdotso/query";
import type { Swap } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { ExecutionWithChainId } from "@lightdotso/types";
import { useMemo } from "react";
import { encodeFunctionData, erc20Abi, fromHex, Hex, type Address } from "viem";
import { useDebouncedValue } from "./useDebouncedValue";
import { useWagmiToken, WagmiToken } from "./useWagmiToken";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type SwapTokenData = Omit<TokenData, "amount"> & {
  amount: bigint;
  original_amount: number;
};

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

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token: fromQueryToken, isTokenLoading: isFromQueryTokenLoading } =
    useQueryToken({
      address: (fromSwap?.address as Address) ?? undefined,
      chain_id: fromSwap?.chainId,
      wallet: wallet as Address,
    });

  const { token: toQueryToken, isTokenLoading: isToQueryTokenLoading } =
    useQueryToken({
      address: (toSwap?.address as Address) ?? undefined,
      chain_id: toSwap?.chainId,
      wallet: wallet as Address,
    });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    wagmiToken: fromWagmiToken,
    isWagmiTokenLoading: isFromWagmiTokenLoading,
  } = useWagmiToken({
    address: wallet as Address,
    chainId: fromSwap?.chainId,
    tokenAddress: fromSwap?.address as Address,
  });

  const {
    wagmiToken: toWagmiToken,
    isWagmiTokenLoading: isToWagmiTokenLoading,
  } = useWagmiToken({
    address: wallet as Address,
    chainId: toSwap?.chainId,
    tokenAddress: toSwap?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  function getSwapToken(
    swap: Swap | undefined,
    queryToken: TokenData | null | undefined,
    wagmiToken: WagmiToken | null | undefined,
  ) {
    let fromSwapToken: SwapTokenData = {
      amount: queryToken?.amount ? BigInt(queryToken?.amount) : 0n,
      original_amount: queryToken?.amount ?? 0,
      balance_usd: queryToken?.balance_usd ?? 0,
      id: queryToken?.id ?? `${swap?.address}-${swap?.chainId}`,
      chain_id: swap?.chainId ?? queryToken?.chain_id ?? 0,
      address: swap?.address ?? queryToken?.address ?? "",
      decimals: queryToken?.decimals ?? 0,
      symbol: queryToken?.symbol ?? "",
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

  const fromSwapToken: SwapTokenData | null = useMemo(() => {
    return getSwapToken(fromSwap, fromQueryToken, fromWagmiToken);
  }, [fromSwap, fromQueryToken, fromWagmiToken]);

  const toSwapToken: SwapTokenData | null = useMemo(() => {
    return getSwapToken(toSwap, toQueryToken, toWagmiToken);
  }, [toSwap, toQueryToken, toWagmiToken]);

  const fromSwapDecimals = useMemo(() => {
    return fromWagmiToken?.decimals ?? fromQueryToken?.decimals;
  }, [fromWagmiToken?.decimals, fromQueryToken?.decimals]);

  const toSwapDecimals = useMemo(() => {
    return toWagmiToken?.decimals ?? toQueryToken?.decimals;
  }, [toWagmiToken?.decimals, toQueryToken?.decimals]);

  const fromSwapMaximumAmount = useMemo(() => {
    return fromSwapToken?.amount;
  }, [fromSwapToken?.amount]);

  const toSwapMaximumAmount = useMemo(() => {
    return toSwapToken?.amount;
  }, [toSwapToken?.amount]);

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

  const fromSwapTokenDollarRatio = useMemo(() => {
    return fromSwapToken?.balance_usd &&
      fromSwapToken?.amount &&
      fromSwapDecimals
      ? fromSwapToken?.balance_usd /
          (Number(fromSwapToken?.original_amount) /
            Math.pow(10, fromSwapDecimals))
      : null;
  }, [
    fromSwapToken?.balance_usd,
    fromSwapToken?.original_amount,
    fromSwapDecimals,
  ]);

  const toSwapTokenDollarRatio = useMemo(() => {
    return toSwapToken?.balance_usd && toSwapToken?.amount && toSwapDecimals
      ? toSwapToken?.balance_usd /
          (Number(toSwapToken?.original_amount) / Math.pow(10, toSwapDecimals))
      : null;
  }, [toSwapToken?.balance_usd, toSwapToken?.original_amount, toSwapDecimals]);

  const fromSwapQuantityDollarValue = useMemo(() => {
    return fromSwap?.quantity && fromSwapTokenDollarRatio
      ? fromSwap?.quantity * fromSwapTokenDollarRatio
      : null;
  }, [fromSwap?.quantity, fromSwapTokenDollarRatio]);

  const toSwapQuantityDollarValue = useMemo(() => {
    return toSwap?.quantity && toSwapTokenDollarRatio
      ? toSwap?.quantity * toSwapTokenDollarRatio
      : null;
  }, [toSwap?.quantity, toSwapTokenDollarRatio]);

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedFromSwapAmount = useDebouncedValue(fromSwapAmount, 800);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { lifiQuote, isLifiQuoteLoading } = useQueryLifiQuote({
    fromAddress: wallet,
    fromChain: fromSwap?.chainId,
    fromToken: fromSwap?.address as Address,
    fromAmount: debouncedFromSwapAmount ?? undefined,
    toAddress: wallet,
    toChain: toSwap?.chainId,
    toToken: toSwap?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const toSwapQuotedAmount = useMemo(() => {
    if (lifiQuote?.estimate?.toAmount) {
      return BigInt(lifiQuote?.estimate?.toAmount);
    }
    return null;
  }, [lifiQuote?.estimate?.toAmount]);

  const toSwapQuotedQuantity = useMemo(() => {
    if (toSwapQuotedAmount && toSwapDecimals) {
      return Number(toSwapQuotedAmount) / Math.pow(10, toSwapDecimals);
    }
    return null;
  }, [toSwapQuotedAmount, toSwapDecimals]);

  const executionsParams: ExecutionWithChainId[] = useMemo(() => {
    let executionIndex = 0;
    let executions: ExecutionWithChainId[] = [];

    // If wallet is not available, return userOperations
    if (!wallet) {
      return [];
    }

    if (lifiQuote && lifiQuote?.transactionRequest) {
      // Get the approval address
      const approvalAddress =
        lifiQuote?.estimate?.approvalAddress ??
        lifiQuote?.transactionRequest?.to;

      // Get the approval amount
      const approvalAmount = lifiQuote?.estimate?.fromAmount
        ? fromHex(lifiQuote?.estimate?.fromAmount as Hex, "bigint")
        : fromSwapAmount;

      // If the buy token is not native, need to approve the token
      if (
        approvalAddress &&
        fromSwapAmount &&
        fromSwap &&
        fromSwap?.address &&
        fromSwap?.address !== "0x0000000000000000000000000000000000000000" &&
        fromSwap?.chainId
      ) {
        const approveExecution: ExecutionWithChainId = {
          address: fromSwap?.address as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, approvalAmount] as [
              Address,
              bigint,
            ],
          }),
          chainId: BigInt(fromSwap?.chainId),
        };

        const revokeExecution: ExecutionWithChainId = {
          address: fromSwap?.address as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, 0n] as [Address, bigint],
          }),
          chainId: BigInt(fromSwap?.chainId),
        };

        executions.push(approveExecution);
        executions.push(revokeExecution);

        // Set the execution index and increment, since we have two executions
        // for approval and revoke, the execution index should be sandwiched
        executionIndex += 1;
      }

      // Set the lifi execution
      const lifiExecution: ExecutionWithChainId = {
        address: lifiQuote?.transactionRequest?.to,
        value: lifiQuote?.transactionRequest?.value
          ? fromHex(lifiQuote?.transactionRequest?.value as Hex, "bigint")
          : 0n,
        callData: lifiQuote?.transactionRequest?.data as Hex,
        chainId: BigInt(lifiQuote?.transactionRequest?.chainId),
      };

      // Add the lifi execution to the corresponding index
      executions.splice(executionIndex, 0, lifiExecution);
    }

    return executions;
  }, [wallet, fromSwapAmount, fromSwap, lifiQuote]);

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
    return isFromQueryTokenLoading || isFromWagmiTokenLoading;
  }, [isFromQueryTokenLoading, isFromWagmiTokenLoading]);

  const isToSwapLoading = useMemo(() => {
    return (
      isFromQueryTokenLoading ||
      isToQueryTokenLoading ||
      isFromWagmiTokenLoading ||
      isToWagmiTokenLoading ||
      isLifiQuoteLoading
    );
  }, [
    isFromQueryTokenLoading,
    isToQueryTokenLoading,
    isFromWagmiTokenLoading,
    isToWagmiTokenLoading,
    isLifiQuoteLoading,
  ]);

  const isSwapNotEmpty = useMemo(() => {
    return fromSwap?.quantity && toSwap?.quantity;
  }, [fromSwap?.quantity, toSwap?.quantity]);

  const isSwapLoading = useMemo(() => {
    return (
      isFromQueryTokenLoading ||
      isToQueryTokenLoading ||
      isFromWagmiTokenLoading ||
      isToWagmiTokenLoading ||
      isLifiQuoteLoading
    );
  }, [
    isFromQueryTokenLoading,
    isToQueryTokenLoading,
    isFromWagmiTokenLoading,
    isToWagmiTokenLoading,
    isLifiQuoteLoading,
  ]);

  const isSwapValid = useMemo(() => {
    return isFromSwapValueValid && isSwapNotEmpty;
  }, [isFromSwapValueValid, isSwapNotEmpty]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    fromSwapToken: fromSwapToken,
    toSwapToken: toSwapToken,
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
    executionsParams: executionsParams,
    fromSwapDecimals: fromSwapDecimals,
    toSwapDecimals: toSwapDecimals,
    fromSwapTokenDollarRatio: fromSwapTokenDollarRatio,
    toSwapTokenDollarRatio: toSwapTokenDollarRatio,
    fromSwapQuantityDollarValue: fromSwapQuantityDollarValue,
    toSwapQuantityDollarValue: toSwapQuantityDollarValue,
    fromSwapMaximumQuantity: fromSwapMaximumQuantity,
    toSwapMaximumQuantity: toSwapMaximumQuantity,
  };
};
