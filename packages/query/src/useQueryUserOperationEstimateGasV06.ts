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

import { estimateUserOperationGasV06 } from "@lightdotso/client";
import {
  CONTRACT_ADDRESSES,
  ContractAddress,
  DEFAULT_USER_OPERATION_PRE_VERIFICATION_GAS_V06,
  DEFAULT_USER_OPERATION_VERIFICATION_GAS_LIMIT_V06,
  GAS_LIMIT_MULTIPLIER,
} from "@lightdotso/const";
import type { EstimateUserOperationGasDataV06 } from "@lightdotso/data";
import type { RpcEstimateUserOperationGasV06Params } from "@lightdotso/params";
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

export const useQueryUserOperationEstimateGasV06 = (
  params: RpcEstimateUserOperationGasV06Params,
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
  const { data: estimatedGas, isLoading: isEstimateGasLoading } =
    useEstimateGas({
      chainId: Number(params?.chainId),
      account: params?.sender as Address,
      data: executions.length > 0 ? executions[0].callData : undefined,
      to: executions.length > 0 ? executions[0].address : undefined,
    });

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
    data: estimateUserOperationGasDataV06,
    isLoading: isOriginalEstimateUserOperationGasDataLoadingV06,
    error: estimateUserOperationGasDataErrorV06,
  } = useQuery<EstimateUserOperationGasDataV06 | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    enabled: isEnabled,
    queryKey: queryKeys.rpc.estimate_user_operation_gas_v06({
      chainId: params?.chainId,
      nonce: params?.nonce,
      initCode: params?.initCode,
      sender: params?.sender,
      callData: params?.callData,
      maxFeePerGas: params?.maxFeePerGas,
      maxPriorityFeePerGas: params?.maxPriorityFeePerGas,
    }).queryKey,
    queryFn: async () => {
      if (
        !params?.chainId ||
        typeof params?.nonce === "undefined" ||
        params?.nonce === null ||
        !params?.initCode ||
        !params?.sender ||
        !params?.callData
      ) {
        return null;
      }

      const res = await estimateUserOperationGasV06(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            nonce: toHex(params?.nonce),
            initCode: params?.initCode,
            callData: params?.callData,
            ...(params?.maxFeePerGas
              ? { maxFeePerGas: toHex(params?.maxFeePerGas) }
              : {}),
            ...(params?.maxPriorityFeePerGas
              ? { maxPriorityFeePerGas: toHex(params?.maxPriorityFeePerGas) }
              : {}),
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
          },
          CONTRACT_ADDRESSES[ContractAddress.ENTRYPOINT_V060_ADDRESS],
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

  const fallbackEstimatedGas = useMemo(() => {
    const calculatedEstimatedGas = totalEstimatedGas ?? estimatedGas;
    return calculatedEstimatedGas
      ? (calculatedEstimatedGas * BigInt(GAS_LIMIT_MULTIPLIER)) / 100n
      : undefined;
  }, [totalEstimatedGas, estimatedGas]);

  const isEstimateUserOperationGasDataLoadingV06 = useMemo(() => {
    return (
      isEstimateGasExecutionsLoading &&
      isEstimateGasLoading &&
      isOriginalEstimateUserOperationGasDataLoadingV06
    );
  }, [
    isEstimateGasExecutionsLoading,
    isEstimateGasLoading,
    isOriginalEstimateUserOperationGasDataLoadingV06,
  ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isEstimateUserOperationGasDataLoadingV06:
      isEstimateUserOperationGasDataLoadingV06,
    estimateUserOperationGasDataErrorV06: estimateUserOperationGasDataErrorV06,
    callGasLimitV06: estimateUserOperationGasDataV06?.callGasLimit
      ? fromHex(estimateUserOperationGasDataV06?.callGasLimit as Hex, {
          to: "bigint",
        })
      : fallbackEstimatedGas,
    preVerificationGasV06: estimateUserOperationGasDataV06?.preVerificationGas
      ? fromHex(estimateUserOperationGasDataV06?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : DEFAULT_USER_OPERATION_PRE_VERIFICATION_GAS_V06,
    verificationGasLimitV06:
      estimateUserOperationGasDataV06?.verificationGasLimit
        ? fromHex(
            estimateUserOperationGasDataV06?.verificationGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : DEFAULT_USER_OPERATION_VERIFICATION_GAS_LIMIT_V06,
  };
};
