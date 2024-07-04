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

// Gas estimation logic heavily adapted from Pimlico's alto bundler.
// From: https://github.com/pimlicolabs/alto/blob/f8dc197e0158615c26dfb91ba522abbed467d709/src/utils/gasPriceManager.ts
// License: GPL-3.0

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
import {
  avalanche,
  avalancheFuji,
  celo,
  celoAlfajores,
  polygon,
  polygonAmoy,
} from "viem/chains";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationFeePerGasProps = {
  address: Address;
  chainId: number;
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

  const { gasSpeed, gasSpeedBumpAmount } = useGasSpeed();

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

  const [maxFeePerGas, maxPriorityFeePerGas] = useMemo(() => {
    const baseMaxPriorityFeePerGas = feesPerGas?.maxPriorityFeePerGas
      ? // Get the `maxPriorityFeePerGas` and apply the speed bump
        (feesPerGas?.maxPriorityFeePerGas * BigInt(gasSpeedBumpAmount)) /
        BigInt(100)
      : null;
    const baseMaxFeePerGas = feesPerGas?.maxFeePerGas
      ? // Get the `maxFeePerGas` and apply the speed bump
        (feesPerGas?.maxFeePerGas * BigInt(gasSpeedBumpAmount)) / BigInt(100)
      : // Fallback to maxPriorityFeePerGas if maxFeePerGas is not available
        baseMaxPriorityFeePerGas ?? null;

    // For celo and alfajores, the maxFeePerGas and maxPriorityFeePerGas are the same
    if (chainId === celo.id || chainId === celoAlfajores.id) {
      // Return the larger of the `baseMaxFeePerGas` and `baseMaxPriorityFeePerGas`
      const baseCeloFeePerGas =
        baseMaxFeePerGas &&
        baseMaxPriorityFeePerGas &&
        baseMaxFeePerGas > baseMaxPriorityFeePerGas
          ? baseMaxFeePerGas
          : baseMaxPriorityFeePerGas;

      // For Celo, we need to multiply the gas price by 3/2
      // https://github.com/pimlicolabs/alto/blob/58bcc4e75a214f9074c7d4c73626960527fa43ce/packages/utils/src/gasPrice.ts#L73-L79
      // License: GPL-3.0
      if (baseCeloFeePerGas) {
        // Multiply the fee by 1.5 to get the max fee per gas
        const celoFeePerGas = (baseCeloFeePerGas * BigInt(3)) / BigInt(2);

        return [celoFeePerGas, celoFeePerGas];
      }
    }

    // For polygon, there's a base max fee per gas
    if (chainId === polygon.id || chainId === polygonAmoy.id) {
      const POLYGON_BASE_MAX_PRIORITY_FEE_PER_GAS = BigInt(35);

      return [
        // Return the larger of the `baseMaxFeePerGas` and the base fee
        baseMaxFeePerGas &&
        baseMaxFeePerGas > POLYGON_BASE_MAX_PRIORITY_FEE_PER_GAS
          ? baseMaxFeePerGas
          : POLYGON_BASE_MAX_PRIORITY_FEE_PER_GAS,
        // Do the same for the `baseMaxPriorityFeePerGas`
        baseMaxPriorityFeePerGas &&
        baseMaxPriorityFeePerGas > POLYGON_BASE_MAX_PRIORITY_FEE_PER_GAS
          ? baseMaxPriorityFeePerGas
          : POLYGON_BASE_MAX_PRIORITY_FEE_PER_GAS,
      ];
    }

    // For avalanche, there's a minimum fee per gas since it returns 0
    if (chainId === avalanche.id || chainId === avalancheFuji.id) {
      const AVALANCHE_BASE_MAX_PRIORITY_FEE_PER_GAS = BigInt(1500000000);

      return [
        // Return the larger of the `baseMaxFeePerGas` and the base fee
        baseMaxFeePerGas &&
        baseMaxFeePerGas > AVALANCHE_BASE_MAX_PRIORITY_FEE_PER_GAS
          ? baseMaxFeePerGas
          : AVALANCHE_BASE_MAX_PRIORITY_FEE_PER_GAS,
        // Do the same for the `baseMaxPriorityFeePerGas`
        baseMaxPriorityFeePerGas &&
        baseMaxPriorityFeePerGas > AVALANCHE_BASE_MAX_PRIORITY_FEE_PER_GAS
          ? baseMaxPriorityFeePerGas
          : AVALANCHE_BASE_MAX_PRIORITY_FEE_PER_GAS,
      ];
    }

    // If gas estimation is available, return the gas estimation
    if (gasEstimation) {
      // Get the estimated max fee per gas
      const estimatedGas = gasEstimation[gasSpeed];

      // Parse the Hex to BigInt
      return [
        fromHex(estimatedGas.maxFeePerGas as Hex, {
          to: "bigint",
        }),
        fromHex(estimatedGas.maxPriorityFeePerGas as Hex, { to: "bigint" }),
      ];
    }

    // Return null if no gas estimation is available
    return [baseMaxFeePerGas, baseMaxPriorityFeePerGas];
  }, [
    feesPerGas?.maxFeePerGas,
    feesPerGas?.maxPriorityFeePerGas,
    chainId,
    gasEstimation,
    gasSpeed,
    gasSpeedBumpAmount,
  ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    maxFeePerGas: maxFeePerGas ?? BigInt(0),
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? BigInt(0),
  };
};
