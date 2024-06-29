// Copyright 2023-2024 Light.
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

import { createConfigurationOperation } from "@lightdotso/client";
import type { ConfigurationOperationData } from "@lightdotso/data";
import type { ConfigurationOperationSimulationParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryConfigurationOperationSimulation = (
  params: ConfigurationOperationSimulationParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: ConfigurationOperationData | undefined =
    queryClient.getQueryData(
      queryKeys.configuration.get({ address: params.address }).queryKey,
    );

  const {
    data: configurationOperationSimulation,
    isLoading: isConfigurationOperationSimulationLoading,
    refetch: refetchConfigurationOperationSimulation,
    failureCount,
  } = useQuery<ConfigurationOperationData | null>({
    queryKey: queryKeys.configuration_operation.simulation({
      address: params.address,
      simulate: true,
    }).queryKey,
    queryFn: async () => {
      const res = await createConfigurationOperation(
        {
          params: {
            query: {
              address: params.address as Address,
              simulate: true,
            },
          },
          body: {
            owners: params.owners,
            threshold: params.threshold,
            signature: {
              owner_id: params.ownerId,
              signature: "0x",
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data;
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentData ?? null;
        },
      );
    },
  });

  return {
    configurationOperationSimulation: configurationOperationSimulation,
    refetchConfigurationOperationSimulation:
      refetchConfigurationOperationSimulation,
    isConfigurationOperationSimulationLoading:
      isConfigurationOperationSimulationLoading,
  };
};
