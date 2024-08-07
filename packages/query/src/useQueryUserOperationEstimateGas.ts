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

import { estimateUserOperationGas } from "@lightdotso/client";
import type { EstimateUserOperationGasData } from "@lightdotso/data";
import type { RpcEstimateUserOperationGasParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";
import { type Hex, fromHex, toHex } from "viem";
import { USER_OPERATION_CONFIG } from "./config";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationEstimateGas = (
  params: RpcEstimateUserOperationGasParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: estimateUserOperationGasData,
    isLoading: isEstimateUserOperationGasDataLoading,
    error: estimateUserOperationGasDataError,
  } = useQuery<EstimateUserOperationGasData | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    queryKey: queryKeys.rpc.estimate_user_operation_gas({
      chainId: params?.chainId,
      nonce: params?.nonce,
      initCode: params?.initCode,
      sender: params?.sender,
      callData: params?.callData,
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

      const res = await estimateUserOperationGas(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            nonce: toHex(params?.nonce),
            initCode: params?.initCode,
            callData: params?.callData,
            paymasterAndData: "0x",
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
          },
          "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        ],
        clientType,
      );

      // Throw error if response is not ok
      return res._unsafeUnwrap();
    },
  });

  return {
    isUserOperationEstimateGasLoading: isEstimateUserOperationGasDataLoading,
    userOperationEstimateGasError: estimateUserOperationGasDataError,
    callGasLimit: estimateUserOperationGasData?.callGasLimit
      ? fromHex(estimateUserOperationGasData?.callGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    preVerificationGas: estimateUserOperationGasData?.preVerificationGas
      ? fromHex(estimateUserOperationGasData?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : undefined,
    verificationGasLimit: estimateUserOperationGasData?.verificationGasLimit
      ? fromHex(estimateUserOperationGasData?.verificationGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
  };
};
