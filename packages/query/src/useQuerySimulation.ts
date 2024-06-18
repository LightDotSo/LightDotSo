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

import { createSimulation } from "@lightdotso/client";
import type { SimulationData } from "@lightdotso/data";
import type { SimulationParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQuerySimulation = (params: SimulationParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: SimulationData | undefined = queryClient.getQueryData(
    queryKeys.simulation.create({
      chain_id: params.chain_id,
      sender: params.sender,
      nonce: params.nonce,
      call_data: params.call_data,
      init_code: params.init_code,
    }).queryKey,
  );

  const {
    data: simulation,
    isLoading: isSimulationLoading,
    failureCount,
  } = useQuery<SimulationData | null>({
    queryKey: queryKeys.simulation.create({
      chain_id: params.chain_id,
      sender: params.sender,
      nonce: params.nonce,
      call_data: params.call_data,
      init_code: params.init_code,
    }).queryKey,
    queryFn: async () => {
      const res = await createSimulation(
        {
          body: {
            chain_id: params.chain_id,
            sender: params.sender,
            nonce: params.nonce,
            call_data: params.call_data,
            init_code: params.init_code,
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as SimulationData;
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
    simulation: simulation,
    isSimulationLoading: isSimulationLoading,
  };
};
