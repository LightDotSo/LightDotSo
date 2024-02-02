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

import { estimateUserOperationGas } from "@lightdotso/client";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { serialize } from "@lightdotso/wagmi";
import { useQuery } from "@tanstack/react-query";
import { toHex } from "viem";

type EstimateUserOperationGasData = {
  callGasLimit: string;
  verificationGas: string;
  verificationGasLimit: string;
  preVerificationGas: string;
};

export const useQueryEstimateUserOperationGas = (
  params: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "paymasterAndData"
    | "callGasLimit"
    | "verificationGasLimit"
    | "preVerificationGas"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
  >,
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
    retry: 10,
    queryKeyHashFn: key => {
      return serialize(key);
    },
    queryKey: queryKeys.rpc.estimate_user_operation_gas({
      chainId: params.nonce,
      nonce: params.nonce,
      initCode: params.initCode,
      sender: params.sender,
      callData: params.callData,
    }).queryKey,
    queryFn: async () => {
      const res = await estimateUserOperationGas(
        Number(params.chainId) as number,
        [
          {
            sender: params.sender,
            nonce: toHex(params.nonce),
            initCode: params.initCode,
            callData: params.callData,
            paymasterAndData:
              "0x000000000003193facb32d1c120719892b7ae97700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065185b1ce67f0444c9d1f99cf4bbb8b44846479ec40b7d28acae4c76abd904808cfe12c0590e10e989801251d867f222cb8c6d9af4cec7189eac7295c624c4216227871e1c",
            signature:
              "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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
    estimateUserOperationGasData,
    isEstimateUserOperationGasDataLoading,
    estimateUserOperationGasDataError,
  };
};
