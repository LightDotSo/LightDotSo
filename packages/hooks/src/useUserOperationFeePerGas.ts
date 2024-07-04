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

import { useQueryGasEstimation, useQueryWallet } from "@lightdotso/query";
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useEstimateMaxPriorityFeePerGas,
} from "@lightdotso/wagmi";
import { fromHex, type Address, type Hex } from "viem";
import { useMemo } from "react";
import { findContractAddressByAddress } from "@lightdotso/utils";
import { WALLET_FACTORY_ENTRYPOINT_MAPPING } from "@lightdotso/const";
import { useGasSpeed } from "@lightdotso/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationFeePerGasProps = {
  address: Address;
  chainId: BigInt;
  callData: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationFeePerGas = ({
  address,
  chainId,
  callData,
}: UserOperationFeePerGasProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { gasSpeed } = useGasSpeed();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Gets the gas estimate
  const { gasEstimation } = useQueryGasEstimation({
    chainId: Number(chainId),
  });

  // Gets the wallet
  const { wallet } = useQueryWallet({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const { data: estimateGas, error: estimateGasError } = useEstimateGas({
    chainId: Number(chainId),
    account: address as Address,
    data: callData as Hex,
    to: WALLET_FACTORY_ENTRYPOINT_MAPPING[
      findContractAddressByAddress(wallet?.factory_address as Address)!
    ],
  });

  // Get the max fee per gas, fallbacks to mainnet
  const { data: feesPerGas } = useEstimateFeesPerGas({
    chainId: Number(chainId),
  });

  // Get the max priority fee per gas, fallbacks to mainnet
  const { data: estimatedMaxPriorityFeePerGas } =
    useEstimateMaxPriorityFeePerGas({
      chainId: Number(chainId),
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const maxFeePerGas = useMemo(() => {
    if (feesPerGas?.maxFeePerGas) {
      // If target chain is Celo, multiply the gas estimate by 3/2.
      if (chainId === BigInt(42220)) {
        return feesPerGas?.maxFeePerGas * (BigInt(3) / BigInt(2));
      }

      // Return the max fee per gas
      return feesPerGas?.maxFeePerGas;
    }

    // If gas estimation is available, return the gas estimation
    if (gasEstimation) {
      // Get the estimated max fee per gas
      const estimatedMaxFeePerGas = gasEstimation[gasSpeed].maxFeePerGas;

      // Parse the Hex to BigInt
      return fromHex(estimatedMaxFeePerGas as Hex, {
        to: "bigint",
      });
    }

    // Return null if no gas estimation is available
    return null;
  }, [feesPerGas?.maxFeePerGas, chainId, gasEstimation, gasSpeed]);

  const maxPriorityFeePerGas = useMemo(() => {
    // If the chain is Celo, `maxFeePerGas` is the same as `maxPriorityFeePerGas`
    return chainId === BigInt(42220)
      ? maxFeePerGas
      : estimatedMaxPriorityFeePerGas;
  }, [chainId, maxFeePerGas, estimatedMaxPriorityFeePerGas]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    maxFeePerGas: maxPriorityFeePerGas ?? BigInt(0),
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? BigInt(0),
  };
};
