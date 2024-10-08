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
import { type Hex, fromHex, toHex } from "viem";
import { USER_OPERATION_CONFIG } from "./config";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryPaymasterGasAndPaymasterAndDataV07 = (
  params: RpcPaymasterGasAndPaymasterAndDataV07Params,
  isEnabled: boolean,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: gasAndPaymasterAndDataV07,
    isLoading: isGasAndPaymasterAndDataLoadingV07,
    error: gasAndPaymasterAndDataErrorV07,
  } = useQuery<PaymasterAndDataV07 | null>({
    ...USER_OPERATION_CONFIG,
    retry: 10,
    enabled: isEnabled,
    queryKey: queryKeys.rpc.get_paymaster_gas_and_paymaster_and_data_v07({
      sender: params?.sender,
      chainId: params?.chainId,
      nonce: params?.nonce,
      factory: params?.factory,
      factoryData: params?.factoryData,
      callData: params?.callData,
      callGasLimit: params?.callGasLimit,
      verificationGasLimit: params?.verificationGasLimit,
      preVerificationGas: params?.preVerificationGas,
      maxFeePerGas: params?.maxFeePerGas,
      maxPriorityFeePerGas: params?.maxPriorityFeePerGas,
      paymasterVerificationGasLimit: params?.paymasterVerificationGasLimit,
    }).queryKey,
    queryFn: async () => {
      if (
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
        !params?.chainId ||
        !params?.sender ||
        typeof params?.nonce === "undefined" ||
        params?.nonce === null ||
        !params?.callData ||
        typeof params?.callGasLimit === "undefined" ||
        params?.callGasLimit === null ||
        !params?.verificationGasLimit ||
        !params?.preVerificationGas ||
        !params?.maxFeePerGas ||
        typeof params?.maxPriorityFeePerGas === "undefined" ||
        params?.maxPriorityFeePerGas === null
      ) {
        return null;
      }

      const res = await getPaymasterGasAndPaymasterAndDataV07(
        Number(params?.chainId) as number,
        [
          {
            sender: params?.sender,
            nonce: toHex(params?.nonce),
            factory: params?.factory ?? null,
            factoryData: params?.factoryData ?? null,
            callData: params?.callData,
            callGasLimit: toHex(params?.callGasLimit),
            verificationGasLimit: toHex(params?.verificationGasLimit),
            preVerificationGas: toHex(params?.preVerificationGas),
            maxFeePerGas: toHex(params?.maxFeePerGas),
            maxPriorityFeePerGas: toHex(params?.maxPriorityFeePerGas),
            paymaster: "0x0000000000000039cd5e8aE05257CE51C473ddd1",
            paymasterData:
              "0x01000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000c350000000000000000000000000000000000000000000000088ed21153e8f500000cd91f19f0f19ce862d7bec7b7d9b95457145afc6f639c28fd0360f488937bfa41e6eedcd3a46054fd95fcd0e3ef6b0bc0a615c4d975eef55c8a3517257904d5b1c",
            paymasterPostOpGasLimit: "0x4e20",
            paymasterVerificationGasLimit:
              params?.paymasterVerificationGasLimit &&
              params?.paymasterVerificationGasLimit !== 0n
                ? toHex(params?.paymasterVerificationGasLimit)
                : "0xc350",
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

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    gasAndPaymasterAndDataV07: gasAndPaymasterAndDataV07,
    callGasLimitV07: gasAndPaymasterAndDataV07?.callGasLimit
      ? fromHex(gasAndPaymasterAndDataV07?.callGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    preVerificationGasV07: gasAndPaymasterAndDataV07?.preVerificationGas
      ? fromHex(gasAndPaymasterAndDataV07?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : undefined,
    verificationGasLimitV07: gasAndPaymasterAndDataV07?.verificationGasLimit
      ? fromHex(gasAndPaymasterAndDataV07?.verificationGasLimit as Hex, {
          to: "bigint",
        })
      : undefined,
    paymasterV07: gasAndPaymasterAndDataV07?.paymaster,
    paymasterVerificationGasLimitV07:
      gasAndPaymasterAndDataV07?.paymasterVerificationGasLimit
        ? fromHex(
            gasAndPaymasterAndDataV07?.paymasterVerificationGasLimit as Hex,
            {
              to: "bigint",
            },
          )
        : undefined,
    paymasterPostOpGasLimitV07:
      gasAndPaymasterAndDataV07?.paymasterPostOpGasLimit
        ? fromHex(gasAndPaymasterAndDataV07?.paymasterPostOpGasLimit as Hex, {
            to: "bigint",
          })
        : undefined,
    paymasterDataV07: gasAndPaymasterAndDataV07?.paymasterData,
    isGasAndPaymasterAndDataLoadingV07: isGasAndPaymasterAndDataLoadingV07,
    gasAndPaymasterAndDataErrorV07: gasAndPaymasterAndDataErrorV07,
  };
};
