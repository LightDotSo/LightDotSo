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

"use client";

import type { Execution } from "@lightdotso/types";
import {
  type DefaultError,
  type QueryKey,
  useQueries,
} from "@tanstack/react-query";
import type { Config, ResolvedRegister } from "@wagmi/core";
import {
  type EstimateGasData,
  type EstimateGasOptions,
  type EstimateGasQueryFnData,
  type EstimateGasQueryKey,
  estimateGasQueryOptions,
} from "@wagmi/core/query";
import { useMemo } from "react";
import type { EstimateGasErrorType } from "viem";
import { useChainId, useConfig, useConnectorClient } from "wagmi";
import type { UseQueryParameters } from "wagmi/query";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export type ConfigParameter<config extends Config = Config> = {
  config?: Config | config | undefined;
};

export type QueryParameter<
  // biome-ignore lint/style/useNamingConvention: <explanation>
  queryFnData = unknown,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  error = DefaultError,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  data = queryFnData,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
      >
    | undefined;
};

export type UseEstimateGasForExecutionsParameters<
  // biome-ignore lint/style/useNamingConvention: <explanation>
  config extends Config = Config,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  selectData = EstimateGasData,
> = EstimateGasOptions<config, chainId> &
  ConfigParameter<config> & {
    executions: Execution[];
  } & QueryParameter<
    EstimateGasQueryFnData,
    EstimateGasErrorType,
    selectData,
    EstimateGasQueryKey<config, chainId>
  >;

export type UseEstimateGasForExecutionsReturnType = {
  estimatedGasPerExecution: (EstimateGasData | undefined)[];
  totalEstimatedGas: EstimateGasData | null;
  isLoading: boolean;
  isError: boolean;
  errors: (Error | null)[];
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useEstimateGasExecutions<
  // biome-ignore lint/style/useNamingConvention: <explanation>
  config extends Config = ResolvedRegister["config"],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  chainId extends config["chains"][number]["id"] | undefined = undefined,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  selectData = EstimateGasData,
>(
  parameters: UseEstimateGasForExecutionsParameters<
    config,
    chainId,
    selectData
  >,
): UseEstimateGasForExecutionsReturnType {
  const { executions, query: originalQuery } = parameters;

  const config = useConfig(parameters);
  const { data: connectorClient } = useConnectorClient({
    connector: parameters.connector,
    query: { enabled: parameters.account === undefined },
  });
  const account = parameters.account ?? connectorClient?.account;
  const chainId = useChainId({ config });

  const queries = executions.map((execution) => {
    const estimateGasOptions = {
      to: execution.address,
      data: execution.callData,
      value: execution.value,
      account,
      chainId: parameters.chainId ?? chainId,
      ...(parameters.accessList && { accessList: parameters.accessList }),
      ...(parameters.gas && { gas: parameters.gas }),
      ...(parameters.gasPrice && { gasPrice: parameters.gasPrice }),
      ...(parameters.maxFeePerGas && { maxFeePerGas: parameters.maxFeePerGas }),
      ...(parameters.maxPriorityFeePerGas && {
        maxPriorityFeePerGas: parameters.maxPriorityFeePerGas,
      }),
      ...(parameters.nonce && { nonce: parameters.nonce }),
    } as const;

    return estimateGasOptions as EstimateGasOptions<config, chainId>;
  });

  const results = useQueries({
    queries: queries.map((query) => ({
      ...estimateGasQueryOptions(config, query),
      enabled:
        Boolean(account || parameters.connector) &&
        originalQuery?.enabled !== false,
    })),
  });

  const estimatedGasPerExecution = results.map((result) => result.data);
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const errors = results.map((result) => result.error || null);

  const totalEstimatedGas = useMemo(() => {
    if (isLoading || isError) {
      return null;
    }
    return estimatedGasPerExecution.reduce<EstimateGasData>(
      (sum, gas) => (gas ? sum + gas : sum),
      0n,
    );
  }, [estimatedGasPerExecution, isLoading, isError]);

  return {
    estimatedGasPerExecution,
    totalEstimatedGas,
    isLoading,
    isError,
    errors,
  };
}
