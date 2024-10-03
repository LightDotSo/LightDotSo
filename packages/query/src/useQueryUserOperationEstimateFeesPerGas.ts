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

import { useAuth } from "@lightdotso/stores";
import { useGasSpeed } from "@lightdotso/stores";
import {
  useEstimateFeesPerGas,
  useEstimateMaxPriorityFeePerGas,
  useGasPrice,
} from "@lightdotso/wagmi/wagmi";
import { useMemo } from "react";
import { type Hex, fromHex } from "viem";
import {
  avalanche,
  avalancheFuji,
  celo,
  celoAlfajores,
  polygon,
  polygonAmoy,
  polygonMumbai,
  scroll,
  scrollSepolia,
} from "viem/chains";
import { USER_OPERATION_CONFIG } from "./config";
import { useQueryGasEstimation } from "./useQueryGasEstimation";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationFeePerGasProps = {
  chainId: number;
};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationEstimateFeesPerGas = ({
  chainId,
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
  const {
    data: feesPerGas,
    error: estimateFeesPerGasError,
    isLoading: isEstimateFeesPerGasLoading,
  } = useEstimateFeesPerGas({
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

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const {
    data: gasPrice,
    error: gasPriceError,
    isLoading: isGasPriceLoading,
  } = useGasPrice({
    chainId: Number(chainId),
  });

  // Get the max priority fee per gas, fallbacks to mainnet
  const {
    data: estimatedMaxPriorityFeePerGas,
    error: estimatedMaxPriorityFeePerGasError,
    isLoading: isEstimatedMaxPriorityFeePerGasLoading,
  } = useEstimateMaxPriorityFeePerGas({
    chainId: Number(chainId),
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isUserOperationEstimateFeesPerGasLoading = useMemo(() => {
    return (
      isEstimateFeesPerGasLoading ||
      isGasPriceLoading ||
      isEstimatedMaxPriorityFeePerGasLoading
    );
  }, [
    isEstimateFeesPerGasLoading,
    isGasPriceLoading,
    isEstimatedMaxPriorityFeePerGasLoading,
  ]);

  const isUserOperationEstimateFeesPerGasError = useMemo(() => {
    return (
      !!estimateFeesPerGasError ||
      !!estimatedMaxPriorityFeePerGasError ||
      !!gasPriceError
    );
  }, [
    estimateFeesPerGasError,
    estimatedMaxPriorityFeePerGasError,
    gasPriceError,
  ]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const [maxFeePerGas, maxPriorityFeePerGas] = useMemo(() => {
    const baseMaxFeePerGas = feesPerGas?.maxFeePerGas
      ? // Get the `maxFeePerGas` and apply the speed bump
        (feesPerGas?.maxFeePerGas * BigInt(gasSpeedBumpAmount)) / BigInt(100)
      : gasPrice;
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info("baseMaxFeePerGas", baseMaxFeePerGas);

    const baseMaxPriorityFeePerGas = feesPerGas?.maxPriorityFeePerGas
      ? // Get the `maxPriorityFeePerGas` and apply the speed bump
        (feesPerGas?.maxPriorityFeePerGas * BigInt(gasSpeedBumpAmount)) /
        BigInt(100)
      : // Fallback to maxPriorityFeePerGas if maxFeePerGas is not available
        (estimatedMaxPriorityFeePerGas ?? baseMaxFeePerGas);
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

      if (
        chainId === polygon.id ||
        chainId === polygonAmoy.id ||
        chainId === polygonMumbai.id
      ) {
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
    if (
      chainId === polygon.id ||
      chainId === polygonAmoy.id ||
      chainId === polygonMumbai.id
    ) {
      const polygonBaseMaxPriorityFeePerGas = BigInt(77500000000);

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
    // Chain id
    chainId,
    // Estimated gas values
    gasPrice,
    estimatedMaxPriorityFeePerGas,
    feesPerGas?.maxFeePerGas,
    feesPerGas?.maxPriorityFeePerGas,
    // Gas estimation values
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
    isUserOperationEstimateFeesPerGasError:
      isUserOperationEstimateFeesPerGasError,
    maxFeePerGas: maxFeePerGas ?? undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
  };
};
