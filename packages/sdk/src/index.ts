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

import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import type { UserOperation } from "@lightdotso/schemas";
import type { ExecutionWithChainId } from "@lightdotso/types";
import { lightWalletAbi } from "@lightdotso/wagmi/generated";
import { type Address, type Hex, encodeFunctionData } from "viem";

export { decodePaymasterAndData } from "./paymaster";

export const generatePartialUserOperations = (
  sender: Address,
  executions: ExecutionWithChainId[],
  walletFactoriesByChainId?: Record<number, Address>,
): Partial<UserOperation>[] => {
  const userOperations: Partial<UserOperation>[] = [];

  // Group executions by chainId
  const executionsByChainId: Record<string, ExecutionWithChainId[]> = {};
  for (const execution of executions) {
    if (!executionsByChainId[execution.chainId.toString()]) {
      executionsByChainId[execution.chainId.toString()] = [];
    }
    executionsByChainId[execution.chainId.toString()].push(execution);
  }

  // Generate user operations
  for (const chainId in executionsByChainId) {
    const executionChainId = BigInt(chainId);
    const executions = executionsByChainId[chainId];
    const walletFactory = walletFactoriesByChainId?.[Number(executionChainId)];

    // Check if the wallet factory for abi v0.1.0 or v0.2.0
    if (
      !walletFactory ||
      walletFactory === CONTRACT_ADDRESSES["v0.1.0 Implementation"] ||
      walletFactory === CONTRACT_ADDRESSES["v0.2.0 Implementation"]
    ) {
      // Check if there's more than one execution for the same chainId
      const executionCallData =
        executions.length === 0
          ? encodeFunctionData({
              abi: lightWalletAbi,
              functionName: "execute",
              args: [
                executions[0].address,
                executions[0].value,
                executions[0].callData,
              ] as [Address, bigint, Hex],
            })
          : encodeFunctionData({
              abi: lightWalletAbi,
              functionName: "executeBatch",
              args: [
                executions.map((execution) => execution.address) as Address[],
                executions.map((execution) => execution.value) as bigint[],
                executions.map((execution) => execution.callData) as Hex[],
              ],
            });

      userOperations.push({
        chainId: executionChainId,
        sender: sender,
        callData: executionCallData,
      });
    }
  }

  return userOperations;
};
