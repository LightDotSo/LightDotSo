// Copyright 2023-2024 Light
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
        _ => {},
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Something went wrong.");
          }

          throw err;
        },
      );
    },
  });

  return {
    logout: logout,
  };
};
