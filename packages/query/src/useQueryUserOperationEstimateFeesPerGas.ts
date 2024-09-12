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

import { WALLET_FACTORY_ENTRYPOINT_MAPPING } from "@lightdotso/const";
import { useAuth } from "@lightdotso/stores";
import { useGasSpeed } from "@lightdotso/stores";
import { findContractAddressByAddress } from "@lightdotso/utils";
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useEstimateMaxPriorityFeePerGas,
} from "@lightdotso/wagmi/wagmi";
import { useMemo } from "react";
import { type Address, type Hex, fromHex } from "viem";
import {
  avalanche,
  avalancheFuji,
  celo,
  celoAlfajores,
  polygon,
  polygonAmoy,
  scroll,
  scrollSepolia,
} from "viem/chains";
import { USER_OPERATION_CONFIG } from "./config";
import { useQueryGasEstimation } from "./useQueryGasEstimation";
import { useQueryWallet } from "./useQueryWallet";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationFeePerGasProps = {
  address: Address;
  chainId: number;
  callData: Hex;
};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationEstimateFeesPerGas = ({
  address,
  chainId,
  callData,
}: UserOperationFeePerGasProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Get the max fee per gas, fallbacks to mainnet
  const { data: feesPerGas, isLoading: isEstimateFeesPerGasLoading } =
    useEstimateFeesPerGas({
      chainId: Number(chainId),
      query: {
        ...USER_OPERATION_CONFIG,
      },
    });

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
  const {
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    data: estimateGas,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    error: estimateGasError,
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    isLoading: isEstimateGasLoading,
  } = useEstimateGas({
    chainId: Number(chainId),
    account: address as Address,
    data: callData as Hex,
    to: WALLET_FACTORY_ENTRYPOINT_MAPPING[
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      findContractAddressByAddress(wallet?.factory_address as Address)!
    ],
  });

  // Get the max priority fee per gas, fallbacks to mainnet
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const { data: estimatedMaxPriorityFeePerGas } =
    useEstimateMaxPriorityFeePerGas({
      chainId: Number(chainId),
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isUserOperationEstimateFeesPerGasLoading = useMemo(() => {
    return isEstimateFeesPerGasLoading;
  }, [isEstimateFeesPerGasLoading]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const [maxFeePerGas, maxPriorityFeePerGas] = useMemo(() => {
    const baseMaxFeePerGas = feesPerGas?.maxFeePerGas
      ? // Get the `maxFeePerGas` and apply the speed bump
        (feesPerGas?.maxFeePerGas * BigInt(gasSpeedBumpAmount)) / BigInt(100)
      : null;

    const baseMaxPriorityFeePerGas = feesPerGas?.maxPriorityFeePerGas
      ? // Get the `maxPriorityFeePerGas` and apply the speed bump
        (feesPerGas?.maxPriorityFeePerGas * BigInt(gasSpeedBumpAmount)) /
        BigInt(100)
      : // Fallback to maxPriorityFeePerGas if maxFeePerGas is not available
        baseMaxFeePerGas;

    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info("baseMaxFeePerGas", baseMaxFeePerGas);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info("baseMaxPriorityFeePerGas", baseMaxPriorityFeePerGas);

    // If gas estimation is available, return the gas estimation
    if (gasEstimation) {
      // Get the estimated max fee per gas
      const estimatedGas = gasEstimation[gasSpeed];

      // Parse the Hex to BigInt
      const gasEstimationMaxFeePerGas = fromHex(
        estimatedGas.maxFeePerGas as Hex,
        {
          to: "bigint",
        },
      );
      const gasEstimationMaxPriorityFeePerGas = fromHex(
        estimatedGas.maxPriorityFeePerGas as Hex,
        { to: "bigint" },
      );

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info("gasEstimationMaxFeePerGas", gasEstimationMaxFeePerGas);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info(
        "gasEstimationMaxPriorityFeePerGas",
        gasEstimationMaxPriorityFeePerGas,
      );

      if (chainId === polygon.id || chainId === polygonAmoy.id) {
        const polygonBaseMaxPriorityFeePerGas = BigInt(77500000000);

        return [
          // Return the larger of the `baseMaxFeePerGas` and `gasEstimationMaxFeePerGas`
          // and the base priority fee per gas
          baseMaxFeePerGas &&
          baseMaxFeePerGas > gasEstimationMaxFeePerGas &&
          baseMaxFeePerGas > polygonBaseMaxPriorityFeePerGas
            ? baseMaxFeePerGas
            : gasEstimationMaxFeePerGas > polygonBaseMaxPriorityFeePerGas
              ? gasEstimationMaxFeePerGas
              : polygonBaseMaxPriorityFeePerGas,
          // Do the same for the `baseMaxPriorityFeePerGas`
          baseMaxPriorityFeePerGas &&
          baseMaxPriorityFeePerGas > gasEstimationMaxPriorityFeePerGas &&
          baseMaxPriorityFeePerGas > polygonBaseMaxPriorityFeePerGas
            ? baseMaxPriorityFeePerGas
            : gasEstimationMaxPriorityFeePerGas >
                polygonBaseMaxPriorityFeePerGas
              ? gasEstimationMaxPriorityFeePerGas
              : polygonBaseMaxPriorityFeePerGas,
        ];
      }
    }

    // For scroll, the maxFeePerGas and maxPriorityFeePerGas are the same
    if (chainId === scroll.id || chainId === scrollSepolia.id) {
      // Return the larger of the `baseMaxFeePerGas` and `baseMaxPriorityFeePerGas`
      const baseGasFeePerGas =
        baseMaxFeePerGas &&
        baseMaxPriorityFeePerGas &&
        baseMaxFeePerGas > baseMaxPriorityFeePerGas
          ? baseMaxFeePerGas
          : baseMaxPriorityFeePerGas;

      if (baseGasFeePerGas) {
        // Return the base gas fee per gas
        return [baseGasFeePerGas, baseGasFeePerGas];
      }
    }

    // For celo and alfajores, the maxFeePerGas and maxPriorityFeePerGas are the same
    if (chainId === celo.id || chainId === celoAlfajores.id) {
      const celoBaseMaxPriorityFeePerGas = BigInt(12000000000);

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

        // Return compared to the celo base max priority fee per gas
        return [
          celoFeePerGas > celoBaseMaxPriorityFeePerGas
            ? celoFeePerGas
            : celoBaseMaxPriorityFeePerGas,
          celoFeePerGas > celoBaseMaxPriorityFeePerGas
            ? celoFeePerGas
            : celoBaseMaxPriorityFeePerGas,
        ];
      }
    }

    // For polygon, there's a base max fee per gas
    if (chainId === polygon.id || chainId === polygonAmoy.id) {
      const polygonBaseMaxPriorityFeePerGas = BigInt(35);

      return [
        // Return the larger of the `baseMaxFeePerGas` and the base fee
        baseMaxFeePerGas && baseMaxFeePerGas > polygonBaseMaxPriorityFeePerGas
          ? baseMaxFeePerGas
          : polygonBaseMaxPriorityFeePerGas,
        // Do the same for the `baseMaxPriorityFeePerGas`
        baseMaxPriorityFeePerGas &&
        baseMaxPriorityFeePerGas > polygonBaseMaxPriorityFeePerGas
          ? baseMaxPriorityFeePerGas
          : polygonBaseMaxPriorityFeePerGas,
      ];
    }

    // For avalanche, there's a minimum fee per gas since it returns 0
    if (chainId === avalanche.id || chainId === avalancheFuji.id) {
      const avalancheBaseMaxPriorityFeePerGas = BigInt(1500000000);

      return [
        // Return the larger of the `baseMaxFeePerGas` and the base fee
        baseMaxFeePerGas && baseMaxFeePerGas > avalancheBaseMaxPriorityFeePerGas
          ? baseMaxFeePerGas
          : avalancheBaseMaxPriorityFeePerGas,
        // Do the same for the `baseMaxPriorityFeePerGas`
        baseMaxPriorityFeePerGas &&
        baseMaxPriorityFeePerGas > avalancheBaseMaxPriorityFeePerGas
          ? baseMaxPriorityFeePerGas
          : avalancheBaseMaxPriorityFeePerGas,
      ];
    }

    if (baseMaxFeePerGas && baseMaxPriorityFeePerGas) {
      return [baseMaxFeePerGas, baseMaxPriorityFeePerGas];
    }

    // Return null if no gas estimation is available
    return [baseMaxFeePerGas, baseMaxPriorityFeePerGas];
  }, [
    chainId,
    feesPerGas?.maxFeePerGas,
    feesPerGas?.maxPriorityFeePerGas,
    gasEstimation,
    gasSpeed,
    gasSpeedBumpAmount,
  ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isUserOperationEstimateFeesPerGasLoading:
      isUserOperationEstimateFeesPerGasLoading,
    maxFeePerGas: maxFeePerGas ?? undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
  };
};
