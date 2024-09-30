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

import { getPaymasterGasAndPaymasterAndDataV06 } from "@lightdotso/client";
import type { PaymasterAndData } from "@lightdotso/data";
import type { RpcPaymasterGasAndPaymasterAndDataParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";
import { type Hex, fromHex, toHex } from "viem";
import { USER_OPERATION_CONFIG } from "./config";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryPaymasterGasAndPaymasterAndData = (
  params: RpcPaymasterGasAndPaymasterAndDataParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: gasAndPaymasterAndData,
    isLoading: isGasAndPaymasterAndDataLoading,
    error: gasAndPaymasterAndDataError,
  } = useQuery<PaymasterAndData | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    queryKey: queryKeys.rpc.get_paymaster_gas_and_paymaster_and_data({
      chainId: params?.chainId,
      nonce: params?.nonce,
      initCode: params?.initCode,
      sender: params?.sender,
      callData: params?.callData,
      callGasLimit: params?.callGasLimit,
      verificationGasLimit: params?.verificationGasLimit,
      preVerificationGas: params?.preVerificationGas,
      maxFeePerGas: params?.maxFeePerGas,
      maxPriorityFeePerGas: params?.maxPriorityFeePerGas,
    }).queryKey,
    queryFn: async () => {
      if (
        !(params?.chainId && params?.sender) ||
        typeof params?.nonce === "undefined" ||
        params?.nonce === null ||
        !params?.initCode ||
        !params?.callData ||
        !params?.callGasLimit ||
        !params?.verificationGasLimit ||
        !params?.preVerificationGas ||
        !params?.maxFeePerGas ||
        !params?.maxPriorityFeePerGas
      ) {
        return null;
      }

      const res = await getPaymasterGasAndPaymasterAndDataV06(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            paymasterAndData: "0x",
            nonce: toHex(params?.nonce),
            initCode: params?.initCode,
            callData: params?.callData,
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
            callGasLimit: toHex(params?.callGasLimit),
            verificationGasLimit: toHex(params?.verificationGasLimit),
            preVerificationGas: toHex(params?.preVerificationGas),
            maxFeePerGas: toHex(params?.maxFeePerGas),
            maxPriorityFeePerGas: toHex(params?.maxPriorityFeePerGas),
          },
        ],
        clientType,
      );

      // Throw error if there is an error
      return res._unsafeUnwrap();
    },
  });

  return {
    gasAndPaymasterAndData: gasAndPaymasterAndData,
    paymasterAndData: gasAndPaymasterAndData?.paymasterAndData,
    callGasLimit: gasAndPaymasterAndData?.callGasLimit
      ? fromHex(gasAndPaymasterAndData?.callGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    preVerificationGas: gasAndPaymasterAndData?.preVerificationGas
      ? fromHex(gasAndPaymasterAndData?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : undefined,
    verificationGasLimit: gasAndPaymasterAndData?.verificationGasLimit
      ? fromHex(gasAndPaymasterAndData?.verificationGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    isGasAndPaymasterAndDataLoading: isGasAndPaymasterAndDataLoading,
    gasAndPaymasterAndDataError: gasAndPaymasterAndDataError,
  };
};
