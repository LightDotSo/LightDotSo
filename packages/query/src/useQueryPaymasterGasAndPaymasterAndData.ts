// Copyright 2023-2024 Light, Inc.
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

import { getPaymasterGasAndPaymasterAndData } from "@lightdotso/client";
import type { PaymasterAndData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { serialize } from "@lightdotso/wagmi";
import { useQuery } from "@tanstack/react-query";
import { toHex } from "viem";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryPaymasterGasAndPaymasterAndData = (
  params: Omit<UserOperation, "hash" | "paymasterAndData" | "signature">,
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
    retry: 10,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 30,
    retryOnMount: false,
    queryKeyHashFn: key => {
      return serialize(key);
    },
    queryKey: queryKeys.rpc.get_paymaster_gas_and_paymaster_and_data({
      chainId: params.chainId,
      nonce: params.nonce,
      initCode: params.initCode,
      sender: params.sender,
      callData: params.callData,
      callGasLimit: params.callGasLimit,
      verificationGasLimit: params.verificationGasLimit,
      preVerificationGas: params.preVerificationGas,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    }).queryKey,
    queryFn: async () => {
      if (
        // Both can be BigInt(0) if the operation is computing the maxFeePerGas
        // Note that `maxPriorityFeePerGas` can be 0 so we only check `maxFeePerGas`
        params.maxFeePerGas === BigInt(0) ||
        // Both can be BigInt(0) if `estimateUserOperationGasData` is pending
        params.callGasLimit === BigInt(0) ||
        params.verificationGasLimit === BigInt(0) ||
        params.preVerificationGas === BigInt(0)
      ) {
        return null;
      }

      const res = await getPaymasterGasAndPaymasterAndData(
        Number(params.chainId) as number,
        [
          {
            sender: params.sender,
            paymasterAndData: "0x",
            nonce: toHex(params.nonce),
            initCode: params.initCode,
            callData: params.callData,
            signature:
              "0x00010000000100013b31d8e3cafd8454ccaf0d4ad859bc76bbefbb7a7533197ca12fa852eba6a38a2e52c99c3b297f1935f9bfabb554176e65b601863cf6a80aa566930e0c05eef51c01",
            callGasLimit: toHex(params.callGasLimit),
            verificationGasLimit: toHex(params.verificationGasLimit),
            preVerificationGas: toHex(params.preVerificationGas),
            maxFeePerGas: toHex(params.maxFeePerGas),
            maxPriorityFeePerGas: toHex(params.maxPriorityFeePerGas),
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
    isGasAndPaymasterAndDataLoading: isGasAndPaymasterAndDataLoading,
    gasAndPaymasterAndDataError: gasAndPaymasterAndDataError,
  };
};
