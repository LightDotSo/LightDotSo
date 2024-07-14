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

import { UserOperation, type Swap } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { useMemo } from "react";
import { useBalance, useReadContract } from "@lightdotso/wagmi";
import { useDebouncedValue } from "./useDebouncedValue";
import { encodeFunctionData, erc20Abi, fromHex, Hex, type Address } from "viem";
import { TokenData } from "@lightdotso/data";
import { useQueryLifiQuote, useQueryToken } from "@lightdotso/query";
import { generatePartialUserOperations } from "@lightdotso/sdk";
import { ExecutionWithChainId } from "@lightdotso/types";
import type { QueryKey } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type NativeBalance = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
};

type SwapTokenData = Omit<TokenData, "amount"> & {
  amount: bigint;
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
  // Wagmi
  // ---------------------------------------------------------------------------

  const {
    data: fromSwapNativeBalance,
    isLoading: isFromSwapNativeBalanceLoading,
    queryKey: fromSwapNativeBalanceQueryKey,
  } = useBalance({
    address: wallet as Address,
    chainId: fromSwap?.chainId,
    query: {
      enabled: Boolean(
        fromSwap &&
          fromSwap?.address === "0x0000000000000000000000000000000000000000",
      ),
    },
  });

  const {
    data: toSwapNativeBalance,
    isLoading: isToSwapNativeBalanceLoading,
    queryKey: toSwapNativeBalanceQueryKey,
  } = useBalance({
    address: wallet as Address,
    chainId: toSwap?.chainId,
    query: {
      enabled: Boolean(
        toSwap &&
          toSwap?.address === "0x0000000000000000000000000000000000000000",
      ),
    },
  });

  const {
    data: fromSwapBalance,
    isLoading: isFromSwapBalanceLoading,
    queryKey: fromSwapBalanceQueryKey,
  } = useReadContract({
    address: fromSwap?.address as Address,
    chainId: fromSwap?.chainId,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet as Address],
    query: {
      enabled: Boolean(
        fromSwap?.address &&
          fromSwap?.address !== "0x0000000000000000000000000000000000000000" &&
          fromSwap?.chainId,
      ),
    },
  });

  const {
    data: toSwapBalance,
    isLoading: isToSwapBalanceLoading,
    queryKey: toSwapBalanceQueryKey,
  } = useReadContract({
    address: toSwap?.address as Address,
    chainId: toSwap?.chainId,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet as Address],
    query: {
      enabled: Boolean(
        toSwap?.address &&
          toSwap?.address !== "0x0000000000000000000000000000000000000000" &&
          toSwap?.chainId,
      ),
    },
  });

  const { data: fromSwapDecimalsNumber } = useReadContract({
    address: fromSwap?.address as Address,
    chainId: fromSwap?.chainId,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(
        fromSwap?.address &&
          fromSwap?.address !== "0x0000000000000000000000000000000000000000" &&
          fromSwap?.chainId,
      ),
    },
  });

  const { data: toSwapDecimalsNumber } = useReadContract({
    address: toSwap?.address as Address,
    chainId: toSwap?.chainId,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(
        toSwap?.address &&
          toSwap?.address !== "0x0000000000000000000000000000000000000000" &&
          toSwap?.chainId,
      ),
    },
  });

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

  function getSwapToken(
    queryToken: TokenData,
    swapNativeBalanceQueryKey: QueryKey,
    swapNativeBalance: NativeBalance | undefined,
    swapBalanceQueryKey: QueryKey,
    swapBalance: bigint | undefined,
  ) {
    let fromSwapToken: SwapTokenData = {
      amount: queryToken?.amount ? BigInt(queryToken?.amount) : 0n,
      balance_usd: queryToken?.balance_usd,
      id: queryToken?.id ?? `${queryToken?.address}-${queryToken?.chain_id}`,
      chain_id: queryToken?.chain_id,
      address: queryToken?.address,
      decimals: queryToken?.decimals,
      symbol: queryToken?.symbol,
    };

    if (swapNativeBalance) {
      if (
        swapNativeBalanceQueryKey &&
        swapNativeBalanceQueryKey.length > 1 &&
        (swapNativeBalanceQueryKey as any)[1].chainId === fromSwapToken.chain_id
      ) {
        fromSwapToken.amount = swapNativeBalance.value;
        fromSwapToken.symbol = swapNativeBalance.symbol;
      }
    }

    if (swapBalance) {
      if (
        swapBalanceQueryKey &&
        swapBalanceQueryKey.length > 1 &&
        (swapBalanceQueryKey as any)[1].chainId === fromSwapToken.chain_id
      ) {
        fromSwapToken.amount = swapBalance;
      }
    }

    return fromSwapToken;
  }

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const fromSwapToken: SwapTokenData | null = useMemo(() => {
    if (!fromQueryToken) {
      return null;
    }

    return getSwapToken(
      fromQueryToken,
      fromSwapNativeBalanceQueryKey,
      fromSwapNativeBalance,
      fromSwapBalanceQueryKey,
      fromSwapBalance,
    );
  }, [
    fromQueryToken,
    fromSwapNativeBalanceQueryKey,
    fromSwapNativeBalance,
    fromSwapBalanceQueryKey,
    fromSwapBalance,
  ]);

  const toSwapToken: SwapTokenData | null = useMemo(() => {
    if (!toQueryToken) {
      return null;
    }

    return getSwapToken(
      toQueryToken,
      toSwapNativeBalanceQueryKey,
      toSwapNativeBalance,
      toSwapBalanceQueryKey,
      toSwapBalance,
    );
  }, [
    toQueryToken,
    toSwapNativeBalance,
    toSwapNativeBalanceQueryKey,
    toSwapBalance,
    toSwapBalanceQueryKey,
  ]);

  const fromSwapDecimals = useMemo(() => {
    return fromSwapDecimalsNumber ?? fromQueryToken?.decimals;
  }, [fromSwapDecimalsNumber]);

  const toSwapDecimals = useMemo(() => {
    return toSwapDecimalsNumber ?? toQueryToken?.decimals;
  }, [toSwapDecimalsNumber]);

  const fromSwapMaximumAmount = useMemo(() => {
    return fromSwap?.address &&
      fromSwap?.address === "0x0000000000000000000000000000000000000000"
      ? fromSwapNativeBalance?.value
      : fromSwapBalance
        ? (fromSwapToken?.amount as bigint)
        : fromSwapToken?.amount
          ? fromSwapToken?.amount
          : null;
  }, [fromSwap, fromSwapNativeBalance, fromSwapBalance, fromSwapToken]);

  const toSwapMaximumAmount = useMemo(() => {
    return toSwap?.address &&
      toSwap?.address === "0x0000000000000000000000000000000000000000"
      ? toSwapNativeBalance?.value
      : toSwapBalance
        ? (toSwapToken?.amount as bigint)
        : toSwapToken?.amount
          ? toSwapToken?.amount
          : null;
  }, [toSwap, toSwapNativeBalance, toSwapBalance, toSwapToken]);

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
      fromSwap?.amount &&
      fromSwap?.quantity &&
      fromSwapDecimals &&
      fromSwapMaximumAmount
    ) {
      // If amount is same as maximum amount, return the amount
      if (fromSwap?.amount === fromSwapMaximumAmount) {
        return fromSwap?.amount;
      }

      // If amount ends in floating point, return the amount without floating point
      const swapAmount = BigInt(
        Math.floor(fromSwap?.quantity * Math.pow(10, fromSwapDecimals)),
      );

      // If swap amount is less than or equal to the buy token amount, return the swap amount
      if (swapAmount <= fromSwapMaximumAmount) {
        return swapAmount;
      } else {
        return fromSwap?.amount;
      }
    }
    return null;
  }, [
    fromSwap,
    fromSwap?.amount,
    fromSwap?.quantity,
    fromSwapDecimals,
    fromSwapMaximumAmount,
  ]);

  const toSwapAmount = useMemo(() => {
    return toSwap?.amount;
  }, [toSwap?.amount]);

  const fromSwapQuantity = useMemo(() => {
    if (fromSwapAmount && fromSwapDecimals) {
      return Number(fromSwapAmount) / Math.pow(10, fromSwapDecimals);
    }
    return null;
  }, [fromSwapAmount, fromSwapDecimals]);

  const toSwapQuantity = useMemo(() => {
    if (toSwapAmount && toSwapDecimals) {
      return Number(toSwapAmount) / Math.pow(10, toSwapDecimals);
    }
    return null;
  }, [toSwapAmount, toSwapDecimals]);

  const fromSwapTokenDollarRatio = useMemo(() => {
    return fromSwapToken?.balance_usd &&
      fromSwapToken?.amount &&
      fromSwapDecimals
      ? fromSwapToken?.balance_usd /
          (Number(fromSwapToken?.amount) / Math.pow(10, fromSwapDecimals))
      : null;
  }, [fromSwapToken?.balance_usd, fromSwapToken?.amount, fromSwapDecimals]);

  const toSwapTokenDollarRatio = useMemo(() => {
    return toSwapToken?.balance_usd && toSwapToken?.amount && toSwapDecimals
      ? toSwapToken?.balance_usd /
          (Number(toSwapToken?.amount) / Math.pow(10, toSwapDecimals))
      : null;
  }, [toSwapToken?.balance_usd, toSwapToken?.amount, toSwapDecimals]);

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
      fromSwapAmount &&
      fromSwapMaximumAmount &&
      fromSwapAmount > 0n &&
      fromSwapAmount <= fromSwapMaximumAmount
    );
  }, [fromSwapAmount, fromSwapMaximumAmount]);

  const isFromSwapLoading = useMemo(() => {
    return (
      isFromQueryTokenLoading ||
      isFromSwapNativeBalanceLoading ||
      isFromSwapBalanceLoading
    );
  }, [
    isFromQueryTokenLoading,
    isFromSwapNativeBalanceLoading,
    isFromSwapBalanceLoading,
  ]);

  const isToSwapLoading = useMemo(() => {
    return (
      isFromQueryTokenLoading ||
      isToQueryTokenLoading ||
      isFromSwapNativeBalanceLoading ||
      isFromSwapBalanceLoading ||
      isToSwapNativeBalanceLoading ||
      isToSwapBalanceLoading ||
      isLifiQuoteLoading
    );
  }, [
    isFromQueryTokenLoading,
    isToQueryTokenLoading,
    isFromSwapNativeBalanceLoading,
    isToSwapNativeBalanceLoading,
    isFromSwapBalanceLoading,
    isToSwapBalanceLoading,
    isLifiQuoteLoading,
  ]);

  const isSwapNotEmpty = useMemo(() => {
    return fromSwap?.amount && toSwap?.amount;
  }, [fromSwap?.amount, toSwap?.amount]);

  const isSwapLoading = useMemo(() => {
    return (
      isFromQueryTokenLoading ||
      isToQueryTokenLoading ||
      isFromSwapNativeBalanceLoading ||
      isFromSwapBalanceLoading ||
      isToSwapNativeBalanceLoading ||
      isToSwapBalanceLoading ||
      isLifiQuoteLoading
    );
  }, [
    isFromQueryTokenLoading,
    isToQueryTokenLoading,
    isFromSwapNativeBalanceLoading,
    isToSwapNativeBalanceLoading,
    isFromSwapBalanceLoading,
    isToSwapBalanceLoading,
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
    fromSwapQuantity: fromSwapQuantity,
    toSwapQuantity: toSwapQuantity,
  };
};
