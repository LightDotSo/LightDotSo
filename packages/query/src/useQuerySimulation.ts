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

import { postCreateSimulation } from "@lightdotso/client";
import type { SimulationData } from "@lightdotso/data";
import type { SimulationParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
      block_number: params.block_number,
      chain_id: params.chain_id,
      data: params.data,
      from: params.from,
      to: params.to,
      value: params.value,
    }).queryKey,
  );

  const { data: token_price } = useQuery<SimulationData | null>({
    queryKey: queryKeys.simulation.create({
      block_number: params.block_number,
      chain_id: params.chain_id,
      data: params.data,
      from: params.from,
      to: params.to,
      value: params.value,
    }).queryKey,
    queryFn: async () => {
      const res = await postCreateSimulation(
        {
          body: {
            block_number: params.block_number,
            chain_id: params.chain_id,
            data: params.data,
            from: params.from,
            to: params.to,
            value: params.value,
          },
        },
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data as SimulationData;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return {
    token_price,
  };
};
