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

"use client";

import { useQueryEstimateUserOperationGas } from "@lightdotso/query";
import { fromHex, type Address, type Hex } from "viem";
import { userOperation, type UserOperation } from "@lightdotso/schemas";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationEstimateGasProps = {
  address: Address;
  targetUserOperation: Pick<
    UserOperation,
    "chainId" | "nonce" | "initCode" | "callData"
  >;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationEstimateGas = ({
  address,
  targetUserOperation,
}: UserOperationEstimateGasProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Gets the gas estimate for the user operation
  const {
    estimateUserOperationGasData,
    isEstimateUserOperationGasDataLoading,
    estimateUserOperationGasDataError,
  } = useQueryEstimateUserOperationGas({
    sender: address as Address,
    chainId: targetUserOperation.chainId,
    nonce: targetUserOperation.nonce,
    initCode: targetUserOperation.initCode,
    callData: targetUserOperation.callData,
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isUserOperationEstimateGasLoading: isEstimateUserOperationGasDataLoading,
    userOperationEstimateGasError: estimateUserOperationGasDataError,
    callGasLimit: estimateUserOperationGasData?.callGasLimit
      ? fromHex(estimateUserOperationGasData?.callGasLimit as Hex, {
          to: "bigint",
        })
      : BigInt(0),
    preVerificationGas: estimateUserOperationGasData?.preVerificationGas
      ? fromHex(estimateUserOperationGasData?.preVerificationGas as Hex, {
          to: "bigint",
        })
      : BigInt(0),
    verificationGasLimit: estimateUserOperationGasData?.verificationGasLimit
      ? fromHex(estimateUserOperationGasData?.verificationGasLimit as Hex, {
          to: "bigint",
        })
      : BigInt(0),
  };
};
