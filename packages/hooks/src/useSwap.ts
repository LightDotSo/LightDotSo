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

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type SwapProps = {
  buySwap: Swap | undefined;
  sellSwap: Swap | undefined;
};

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useSwap = ({ buySwap, sellSwap }: SwapProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token: buyQueryToken, isTokenLoading: isBuyQueryTokenLoading } =
    useQueryToken({
      address: (buySwap?.token?.address as Address) ?? undefined,
      chain_id: buySwap?.chainId,
      wallet: wallet as Address,
    });

  const { token: sellQueryToken, isTokenLoading: isSellQueryTokenLoading } =
    useQueryToken({
      address: (sellSwap?.token?.address as Address) ?? undefined,
      chain_id: sellSwap?.chainId,
      wallet: wallet as Address,
    });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const {
    data: buySwapNativeBalance,
    isLoading: isBuySwapNativeBalanceLoading,
    queryKey: buySwapNativeBalanceQueryKey,
  } = useBalance({
    address: wallet as Address,
    chainId: buySwap?.chainId,
    query: {
      enabled: Boolean(
        buySwap?.token &&
          buySwap?.token?.address ===
            "0x0000000000000000000000000000000000000000",
      ),
    },
  });

  const {
    data: sellSwapNativeBalance,
    isLoading: isSellSwapNativeBalanceLoading,
    queryKey: sellSwapNativeBalanceQueryKey,
  } = useBalance({
    address: wallet as Address,
    chainId: sellSwap?.chainId,
    query: {
      enabled: Boolean(
        sellSwap?.token &&
          sellSwap?.token?.address ===
            "0x0000000000000000000000000000000000000000",
      ),
    },
  });

  const {
    data: buySwapBalance,
    isLoading: isBuySwapBalanceLoading,
    queryKey: buySwapBalanceQueryKey,
  } = useReadContract({
    address: buySwap?.token?.address as Address,
    chainId: buySwap?.chainId,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet as Address],
    query: {
      enabled: Boolean(
        buySwap?.token?.address &&
          buySwap?.token?.address !==
            "0x0000000000000000000000000000000000000000" &&
          buySwap?.chainId,
      ),
    },
  });

  const {
    data: sellSwapBalance,
    isLoading: isSellSwapBalanceLoading,
    queryKey: sellSwapBalanceQueryKey,
  } = useReadContract({
    address: sellSwap?.token?.address as Address,
    chainId: sellSwap?.chainId,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet as Address],
    query: {
      enabled: Boolean(
        sellSwap?.token?.address &&
          sellSwap?.token?.address !==
            "0x0000000000000000000000000000000000000000" &&
          sellSwap?.chainId,
      ),
    },
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const buyToken: TokenData | null = useMemo(() => {
    if (buyQueryToken) {
      if (buySwapNativeBalance) {
        if (
          buySwapNativeBalanceQueryKey &&
          buySwapNativeBalanceQueryKey.length > 2 &&
          (buySwapNativeBalanceQueryKey[1] as any).chainId ===
            buyQueryToken.chain_id
        ) {
          buyQueryToken.amount = Number(buySwapNativeBalance.value);
          buyQueryToken.symbol = buySwapNativeBalance.symbol;
        }
      }
      if (buySwapBalance) {
        if (
          buySwapBalanceQueryKey &&
          buySwapBalanceQueryKey.length > 2 &&
          (buySwapBalanceQueryKey[1] as any).chainId === buyQueryToken.chain_id
        ) {
          buyQueryToken.amount = Number(buySwapBalance);
        }
      }
      return buyQueryToken;
    }

    if (
      buySwap?.token?.address &&
      buySwap?.chainId &&
      buySwap?.token?.symbol &&
      buySwap?.token?.decimals
    ) {
      const buySwapToken: TokenData = {
        amount: 0,
        balance_usd: 0,
        id: `${buySwap?.token?.address}-${buySwap?.chainId}`,
        address: buySwap?.token?.address as Address,
        chain_id: buySwap?.chainId,
        decimals: buySwap?.token?.decimals,
        symbol: buySwap?.token?.symbol,
      };
      return buySwapToken;
    }

    return null;
  }, [
    buyQueryToken,
    buySwap,
    buySwapNativeBalance,
    buySwapBalanceQueryKey,
    buySwapBalance,
  ]);

  const sellToken: TokenData | null = useMemo(() => {
    if (sellQueryToken) {
      if (sellSwapNativeBalance) {
        if (
          sellSwapNativeBalanceQueryKey &&
          sellSwapNativeBalanceQueryKey.length > 2 &&
          (sellSwapNativeBalanceQueryKey[1] as any).chainId ===
            sellQueryToken.chain_id
        ) {
          sellQueryToken.amount = Number(sellSwapNativeBalance.value);
          sellQueryToken.symbol = sellSwapNativeBalance.symbol;
        }
      }
      if (sellSwapBalance) {
        if (
          sellSwapBalanceQueryKey &&
          sellSwapBalanceQueryKey.length > 2 &&
          (sellSwapBalanceQueryKey[1] as any).chainId ===
            sellQueryToken.chain_id
        ) {
          sellQueryToken.amount = Number(sellSwapBalance);
        }
      }
      return sellQueryToken;
    }

    if (
      sellSwap?.token?.address &&
      sellSwap?.chainId &&
      sellSwap?.token?.symbol &&
      sellSwap?.token?.decimals
    ) {
      const sellSwapToken: TokenData = {
        amount: 0,
        balance_usd: 0,
        id: `${sellSwap?.token?.address}-${sellSwap?.chainId}`,
        address: sellSwap?.token?.address as Address,
        chain_id: sellSwap?.chainId,
        decimals: sellSwap?.token?.decimals,
        symbol: sellSwap?.token?.symbol,
      };
      return sellSwapToken;
    }

    return null;
  }, [
    sellQueryToken,
    sellSwap,
    sellSwapNativeBalance,
    sellSwapNativeBalanceQueryKey,
    sellSwapBalance,
    sellSwapBalanceQueryKey,
  ]);

  const buySwapAmount = useMemo(() => {
    if (buySwap && buySwap?.token?.value && buyToken?.decimals) {
      // If amount ends in floating point, return the amount without floating point
      return Math.floor(
        buySwap?.token?.value * Math.pow(10, buyToken?.decimals),
      );
    }
    return null;
  }, [buySwap, buySwap?.token?.value, buySwap?.token?.decimals]);

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedBuySwapAmount = useDebouncedValue(buySwapAmount, 800);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { lifiQuote, isLifiQuoteLoading } = useQueryLifiQuote({
    fromAddress: wallet,
    fromChain: buyToken?.chain_id,
    fromToken: buyToken?.address as Address,
    fromAmount: debouncedBuySwapAmount ?? undefined,
    toAddress: wallet,
    toChain: sellToken?.chain_id,
    toToken: sellToken?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const sellSwapAmount = useMemo(() => {
    if (lifiQuote?.estimate?.toAmount) {
      return lifiQuote?.estimate?.toAmount;
    }
    return null;
  }, [lifiQuote?.estimate?.toAmount]);

  const userOperationsParams: Partial<UserOperation>[] = useMemo(() => {
    let executionIndex = 0;
    let executions: ExecutionWithChainId[] = [];
    let userOperations: Partial<UserOperation>[] = [];

    // If wallet is not available, return userOperations
    if (!wallet) {
      return userOperations;
    }

    if (lifiQuote && lifiQuote?.transactionRequest) {
      // Get the approval address
      const approvalAddress =
        lifiQuote?.estimate?.approvalAddress ??
        lifiQuote?.transactionRequest?.to;

      // Get the approval amount
      const approvalAmount = lifiQuote?.estimate?.fromAmount
        ? fromHex(lifiQuote?.estimate?.fromAmount as Hex, "bigint")
        : buySwapAmount;

      // If the buy token is not native, need to approve the token
      if (
        approvalAddress &&
        buySwapAmount &&
        buyToken &&
        buyToken?.address &&
        buyToken?.address !== "0x0000000000000000000000000000000000000000"
      ) {
        const approveExecution: ExecutionWithChainId = {
          address: buyToken?.address as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, approvalAmount] as [
              Address,
              bigint,
            ],
          }),
          chainId: BigInt(buyToken?.chain_id),
        };

        const revokeExecution: ExecutionWithChainId = {
          address: buyToken?.address as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, 0n] as [Address, bigint],
          }),
          chainId: BigInt(buyToken?.chain_id),
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

    return generatePartialUserOperations(wallet, executions);
  }, [wallet, buySwapAmount, buyToken, lifiQuote]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isBuySwapValueValid = useMemo(() => {
    if (buyToken && buySwap?.token?.value && buySwap?.token?.decimals) {
      return (
        buySwap.token.value * Math.pow(10, buySwap.token.decimals) <=
        buyToken.amount
      );
    }
  }, [buyToken, buySwap?.token?.value, buySwap?.token?.decimals]);

  const isBuySwapLoading = useMemo(() => {
    return (
      isBuyQueryTokenLoading ||
      isBuySwapNativeBalanceLoading ||
      isBuySwapBalanceLoading
    );
  }, [
    isBuyQueryTokenLoading,
    isBuySwapNativeBalanceLoading,
    isBuySwapBalanceLoading,
  ]);

  const isSellSwapLoading = useMemo(() => {
    return (
      isBuyQueryTokenLoading ||
      isSellQueryTokenLoading ||
      isBuySwapNativeBalanceLoading ||
      isBuySwapBalanceLoading ||
      isSellSwapNativeBalanceLoading ||
      isSellSwapBalanceLoading ||
      isLifiQuoteLoading
    );
  }, [
    isBuyQueryTokenLoading,
    isSellQueryTokenLoading,
    isBuySwapNativeBalanceLoading,
    isSellSwapNativeBalanceLoading,
    isBuySwapBalanceLoading,
    isSellSwapBalanceLoading,
    isLifiQuoteLoading,
  ]);

  const isSwapNotEmpty = useMemo(() => {
    return buyToken?.amount && sellToken?.amount;
  }, [buyToken?.amount, sellToken?.amount]);

  const isSwapLoading = useMemo(() => {
    return (
      isBuyQueryTokenLoading ||
      isSellQueryTokenLoading ||
      isBuySwapNativeBalanceLoading ||
      isBuySwapBalanceLoading ||
      isSellSwapNativeBalanceLoading ||
      isSellSwapBalanceLoading ||
      isLifiQuoteLoading
    );
  }, [
    isBuyQueryTokenLoading,
    isSellQueryTokenLoading,
    isBuySwapNativeBalanceLoading,
    isSellSwapNativeBalanceLoading,
    isBuySwapBalanceLoading,
    isSellSwapBalanceLoading,
    isLifiQuoteLoading,
  ]);

  const isSwapValid = useMemo(() => {
    return isBuySwapValueValid && isSwapNotEmpty;
  }, [isBuySwapValueValid, isSwapNotEmpty]);

  return {
    buyToken: buyToken,
    sellToken: sellToken,
    buySwapAmount: debouncedBuySwapAmount,
    sellSwapAmount: sellSwapAmount,
    isBuySwapLoading: isBuySwapLoading,
    isSellSwapLoading: isSellSwapLoading,
    isSwapLoading: isSwapLoading,
    isSwapValid: isSwapValid,
    userOperationsParams: userOperationsParams,
  };
};
