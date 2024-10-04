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

import { estimateUserOperationGasV07 } from "@lightdotso/client";
import {
  CONTRACT_ADDRESSES,
  ContractAddress,
  DEFAULT_USER_OPERATION_PRE_VERIFICATION_GAS_V07,
  DEFAULT_USER_OPERATION_VERIFICATION_GAS_LIMIT_V07,
} from "@lightdotso/const";
import type { EstimateUserOperationGasDataV07 } from "@lightdotso/data";
import type { RpcEstimateUserOperationGasV07Params } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { decodeCallDataToExecution } from "@lightdotso/sdk";
import { useAuth } from "@lightdotso/stores";
import { useEstimateGasExecutions } from "@lightdotso/wagmi/hooks";
import { useEstimateGas } from "@lightdotso/wagmi/wagmi";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { type Address, type Hex, fromHex, toHex } from "viem";
import { USER_OPERATION_CONFIG } from "./config";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationEstimateGasV07 = (
  params: RpcEstimateUserOperationGasV07Params,
  isPaymasterEnabled: boolean,
  isEnabled: boolean,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const { executions } = useMemo(() => {
    return decodeCallDataToExecution(params?.callData as Hex);
  }, [params?.callData]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const { data: estimateGas, isLoading: isEstimateGasLoading } = useEstimateGas(
    {
      chainId: Number(params?.chainId),
      account: params?.sender as Address,
      data: executions.length > 0 ? executions[0].callData : undefined,
      to: executions.length > 0 ? executions[0].address : undefined,
    },
  );

  // Get the gas estimate for the user operation
  const { totalEstimatedGas, isLoading: isEstimateGasExecutionsLoading } =
    useEstimateGasExecutions({
      executions: executions,
      chainId: Number(params?.chainId),
      account: params?.sender as Address,
    });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: estimateUserOperationGasDataV07,
    isLoading: isOriginalEstimateUserOperationGasDataLoadingV07,
    error: estimateUserOperationGasDataErrorV07,
  } = useQuery<EstimateUserOperationGasDataV07 | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    enabled: isEnabled,
    queryKey: queryKeys.rpc.estimate_user_operation_gas_v07({
      chainId: params?.chainId,
      sender: params?.sender,
      nonce: params?.nonce,
      factory: params?.factory,
      factoryData: params?.factoryData,
      callData: params?.callData,
      maxFeePerGas: params?.maxFeePerGas,
      maxPriorityFeePerGas: params?.maxPriorityFeePerGas,
    }).queryKey,
    queryFn: async () => {
      if (
        !params?.chainId ||
        typeof params?.nonce === "undefined" ||
        params?.nonce === null ||
        !params?.sender ||
        !params?.callData
      ) {
        return null;
      }

      const res = await estimateUserOperationGasV07(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            nonce: toHex(params?.nonce),
            callData: params?.callData,
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
            ...(params?.factory
              ? {
                  factory: params?.factory,
                }
              : {}),
            ...(params?.factoryData
              ? {
                  factoryData: params?.factoryData,
                }
              : {}),
            ...(params?.maxFeePerGas
              ? { maxFeePerGas: toHex(params?.maxFeePerGas) }
              : {}),
            ...(params?.maxPriorityFeePerGas
              ? { maxPriorityFeePerGas: toHex(params?.maxPriorityFeePerGas) }
              : {}),
            ...(isPaymasterEnabled
              ? {
                  paymaster: "0x0000000000000039cd5e8aE05257CE51C473ddd1",
                  paymasterData:
                    "0x01000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000c350000000000000000000000000000000000000000000000088ed21153e8f500000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c",
                  paymasterVerificationGasLimit: "0xc350",
                  paymasterPostOpGasLimit: "0x4e20",
                }
              : {}),
          },
          CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V070_ADDRESS],
        ],
        clientType,
      );

      // Throw error if response is not ok
      return res._unsafeUnwrap();
    },
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isEstimateUserOperationGasDataLoadingV07 = useMemo(() => {
    return (
      isEstimateGasExecutionsLoading &&
      isEstimateGasLoading &&
      isOriginalEstimateUserOperationGasDataLoadingV07
    );
  }, [
    isEstimateGasExecutionsLoading,
    isEstimateGasLoading,
    isOriginalEstimateUserOperationGasDataLoadingV07,
  ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isEstimateUserOperationGasDataLoadingV07:
      isEstimateUserOperationGasDataLoadingV07,
    estimateUserOperationGasDataErrorV07: estimateUserOperationGasDataErrorV07,
    callGasLimitV07: estimateUserOperationGasDataV07?.callGasLimit
      ? fromHex(estimateUserOperationGasDataV07?.callGasLimit as Hex, {
          to: "bigint",
        })
      : (totalEstimatedGas ?? estimateGas),
    preVerificationGasV07: estimateUserOperationGasDataV07?.preVerificationGas
      ? fromHex(estimateUserOperationGasDataV07?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : DEFAULT_USER_OPERATION_PRE_VERIFICATION_GAS_V07,
    verificationGasLimitV07:
      estimateUserOperationGasDataV07?.verificationGasLimit
        ? fromHex(
            estimateUserOperationGasDataV07?.verificationGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : DEFAULT_USER_OPERATION_VERIFICATION_GAS_LIMIT_V07,
    paymasterVerificationGasLimitV07:
      estimateUserOperationGasDataV07?.paymasterVerificationGasLimit
        ? fromHex(
            estimateUserOperationGasDataV07?.paymasterVerificationGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : undefined,
    paymasterPostOpGasLimitV07:
      estimateUserOperationGasDataV07?.paymasterPostOpGasLimit
        ? fromHex(
            estimateUserOperationGasDataV07?.paymasterPostOpGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : undefined,
  };
};
