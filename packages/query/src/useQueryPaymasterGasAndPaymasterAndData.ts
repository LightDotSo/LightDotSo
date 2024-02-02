// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { getPaymasterGasAndPaymasterAndData } from "@lightdotso/client";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { serialize } from "@lightdotso/wagmi";
import { useQuery } from "@tanstack/react-query";
import { toHex } from "viem";

type PaymasterAndData = {
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  paymasterNonce: string;
};

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
    data: paymasterAndData,
    isLoading: isPaymasterAndDataLoading,
    error: paymasterAndDataError,
  } = useQuery<PaymasterAndData | null>({
    retry: 10,
    queryKeyHashFn: key => {
      return serialize(key);
    },
    queryKey: queryKeys.rpc.get_paymaster_gas_and_paymaster_and_data({
      chainId: params.nonce,
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
        !params.callGasLimit ||
        !params.verificationGasLimit ||
        !params.preVerificationGas ||
        !params.maxFeePerGas ||
        !params.maxPriorityFeePerGas
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
    paymasterAndData,
    isPaymasterAndDataLoading,
    paymasterAndDataError,
  };
};
