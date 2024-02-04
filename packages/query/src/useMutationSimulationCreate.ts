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

import { createSimulation } from "@lightdotso/client";
import type { SimulationCreateBodyParams } from "@lightdotso/params/src/simulation";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationSimulationCreate = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: logout } = useMutation({
    mutationFn: async (body: SimulationCreateBodyParams) => {
      const res = await createSimulation(
        {
          body: {
            chain_id: body.chain_id,
            sender: body.sender,
            nonce: body.nonce,
            call_data: body.call_data,
            init_code: body.init_code,
          },
        },
        clientType,
      );

      res.match(
        _ => {
          toast.success("Successfully logged out.");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to log out.");
          }

          throw err;
        },
      );
    },
  });

  return {
    logout,
  };
};
