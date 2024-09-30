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

import { getPaymasterGasAndPaymasterAndDataV07 } from "@lightdotso/client";
import type { PaymasterAndDataV07 } from "@lightdotso/data";
import type { RpcPaymasterGasAndPaymasterAndDataV07Params } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";
import { type Address, type Hex, fromHex, toHex } from "viem";
import { USER_OPERATION_CONFIG } from "./config";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryPaymasterGasAndPaymasterAndDataV07 = (
  params: RpcPaymasterGasAndPaymasterAndDataV07Params,
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
  } = useQuery<PaymasterAndDataV07 | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    queryKey: queryKeys.rpc.get_paymaster_gas_and_paymaster_and_data_v07({
      chainId: params?.chainId,
      nonce: params?.nonce,
      factory: params?.factory,
      factoryData: params?.factoryData,
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
        !params?.callData ||
        !params?.callGasLimit ||
        !params?.verificationGasLimit ||
        !params?.preVerificationGas ||
        !params?.maxFeePerGas ||
        !params?.maxPriorityFeePerGas
      ) {
        return null;
      }

      const res = await getPaymasterGasAndPaymasterAndDataV07(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            nonce: toHex(params?.nonce),
            factory: params?.factory,
            factoryData: params?.factoryData,
            callData: params?.callData,
            callGasLimit: toHex(params?.callGasLimit),
            verificationGasLimit: toHex(params?.verificationGasLimit),
            preVerificationGas: toHex(params?.preVerificationGas),
            maxFeePerGas: toHex(params?.maxFeePerGas),
            maxPriorityFeePerGas: toHex(params?.maxPriorityFeePerGas),
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
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
    paymaster: gasAndPaymasterAndData?.paymaster
      ? (fromHex(gasAndPaymasterAndData?.paymaster as Hex, {
          to: "string",
        }) as Address)
      : undefined,
    paymasterVerificationGasLimit:
      gasAndPaymasterAndData?.paymasterVerificationGasLimit
        ? fromHex(
            gasAndPaymasterAndData?.paymasterVerificationGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : undefined,
    paymasterPostOpGasLimit: gasAndPaymasterAndData?.paymasterPostOpGasLimit
      ? fromHex(gasAndPaymasterAndData?.paymasterPostOpGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    paymasterData: gasAndPaymasterAndData?.paymasterData
      ? fromHex(gasAndPaymasterAndData?.paymasterData as Hex, {
          to: "string",
        })
      : undefined,
    isGasAndPaymasterAndDataLoading: isGasAndPaymasterAndDataLoading,
    gasAndPaymasterAndDataError: gasAndPaymasterAndDataError,
  };
};
