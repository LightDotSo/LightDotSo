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
import { UserOperation } from "@lightdotso/schemas";
import { serializeBigInt } from "@lightdotso/utils";
import { useAuth } from "@lightdotso/stores";
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
    queryKeyHashFn: key => {
      return serializeBigInt(key);
    },
    queryKey: queryKeys.user_operation.get_paymaster_gas_and_paymaster_and_data(
      {
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
      },
    ).queryKey,
    queryFn: async () => {
      const res = await getPaymasterGasAndPaymasterAndData(
        Number(params.chainId) as number,
        [
          {
            sender: params.sender,
            paymasterAndData: "0x",
            nonce: toHex(params.nonce),
            initCode: params.initCode,
            callData: params.callData,
            signature: "0x",
            callGasLimit: toHex(params.callGasLimit),
            verificationGasLimit: toHex(params.verificationGasLimit),
            preVerificationGas: toHex(params.preVerificationGas),
            maxFeePerGas: toHex(params.maxFeePerGas),
            maxPriorityFeePerGas: toHex(params.maxPriorityFeePerGas),
          },
        ],
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return null;
        },
      );
    },
  });

  return {
    paymasterAndData,
    isPaymasterAndDataLoading,
    paymasterAndDataError,
  };
};
