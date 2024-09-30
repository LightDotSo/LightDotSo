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

import { useQueryLifiQuote } from "@lightdotso/query";
import type { ExecutionWithChainId } from "@lightdotso/types";
import { useMemo } from "react";
import {
  type Address,
  type Hex,
  encodeFunctionData,
  erc20Abi,
  fromHex,
} from "viem";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export type QuoteProps = {
  fromAddress: Address;
  fromChainId: number | undefined;
  fromTokenAddress: Address;
  toAddress: Address;
  toChainId: number | undefined;
  toTokenAddress: Address;
  fromAmount: bigint | undefined;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useQuote = ({
  fromAddress,
  fromChainId,
  fromTokenAddress,
  toAddress,
  toChainId,
  toTokenAddress,
  fromAmount,
}: QuoteProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { lifiQuote, isLifiQuoteLoading } = useQueryLifiQuote({
    fromAddress: fromAddress,
    fromChain: fromChainId,
    fromToken: fromTokenAddress,
    fromAmount: fromAmount,
    toAddress: toAddress,
    toChain: toChainId,
    toToken: toTokenAddress,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const quote = useMemo(() => {
    return lifiQuote;
  }, [lifiQuote]);

  const toQuotedAmount = useMemo(() => {
    if (lifiQuote?.estimate?.toAmount) {
      return BigInt(lifiQuote?.estimate?.toAmount);
    }
    return null;
  }, [lifiQuote?.estimate?.toAmount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const executionParams: ExecutionWithChainId[] = useMemo(() => {
    let executionIndex = 0;
    const executions: ExecutionWithChainId[] = [];

    // If wallet is not available, return userOperations
    if (!(fromTokenAddress && fromChainId)) {
      return [];
    }

    if (fromTokenAddress === toTokenAddress && fromChainId === toChainId) {
      if (fromTokenAddress === "0x0000000000000000000000000000000000000000") {
        // Encode the native execution
        const nativeExecution: ExecutionWithChainId = {
          address: toAddress as Hex,
          value: fromAmount as bigint,
          callData: "0x",
          chainId: BigInt(toChainId),
        };

        // Add the native execution
        executions.push(nativeExecution);
      } else {
        // Encode the transfer function
        const transferExecution: ExecutionWithChainId = {
          address: fromTokenAddress as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [toAddress as Address, fromAmount] as [Address, bigint],
          }),
          chainId: BigInt(fromChainId),
        };

        // Add the transfer execution
        executions.push(transferExecution);
      }
    }

    if (lifiQuote?.transactionRequest) {
      // Get the approval address
      const approvalAddress =
        lifiQuote?.estimate?.approvalAddress ??
        lifiQuote?.transactionRequest?.to;

      // Get the approval amount
      const approvalAmount = lifiQuote?.estimate?.fromAmount
        ? fromHex(lifiQuote?.estimate?.fromAmount as Hex, "bigint")
        : fromAmount;

      // If the buy token is not native, need to approve the token
      if (
        approvalAddress &&
        fromAmount &&
        fromTokenAddress &&
        fromTokenAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        const approveExecution: ExecutionWithChainId = {
          address: fromTokenAddress as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, approvalAmount] as [
              Address,
              bigint,
            ],
          }),
          chainId: BigInt(fromChainId),
        };

        const revokeExecution: ExecutionWithChainId = {
          address: fromTokenAddress as Hex,
          value: 0n,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [approvalAddress as Address, 0n] as [Address, bigint],
          }),
          chainId: BigInt(fromChainId),
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
        chainId: BigInt(fromChainId),
      };

      // Add the lifi execution to the corresponding index
      executions.splice(executionIndex, 0, lifiExecution);
    }

    return executions;
  }, [fromTokenAddress, fromAmount, lifiQuote]);

  const isQuoteLoading = useMemo(() => {
    return isLifiQuoteLoading;
  }, [isLifiQuoteLoading]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    quote: quote,
    toQuotedAmount: toQuotedAmount,
    executionParams: executionParams,
    isQuoteLoading: isQuoteLoading,
  };
};
