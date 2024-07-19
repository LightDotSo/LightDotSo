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
import { ExecutionWithChainId } from "@lightdotso/types";
import { useMemo } from "react";
import { encodeFunctionData, erc20Abi, fromHex, Hex, type Address } from "viem";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export type QuoteParams = {
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
}: QuoteParams) => {
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

  const toQuotedAmount = useMemo(() => {
    if (lifiQuote?.estimate?.toAmount) {
      return BigInt(lifiQuote?.estimate?.toAmount);
    }
    return null;
  }, [lifiQuote?.estimate?.toAmount]);

  const executionParams: ExecutionWithChainId[] = useMemo(() => {
    let executionIndex = 0;
    let executions: ExecutionWithChainId[] = [];

    // If wallet is not available, return userOperations
    if (!fromAddress || !fromChainId) {
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
        : fromAmount;

      // If the buy token is not native, need to approve the token
      if (
        approvalAddress &&
        fromAmount &&
        fromAddress &&
        fromAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        const approveExecution: ExecutionWithChainId = {
          address: fromAddress as Hex,
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
          address: fromAddress as Hex,
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
  }, [fromAddress, fromAmount, lifiQuote]);

  const isQuoteLoading = useMemo(() => {
    return isLifiQuoteLoading;
  }, [isLifiQuoteLoading]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    toQuotedAmount: toQuotedAmount,
    executionParams: executionParams,
    isQuoteLoading: isQuoteLoading,
  };
};
