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

import { createQueueInterpretation } from "@lightdotso/client";
import type { QueueInterpretationCreateParams } from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationQueueInterpretation = (
  params: QueueInterpretationCreateParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { mutate, isPending, isSuccess, isError } = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: async () => {
      const loadingToast = toast.loading("Creating wallet...");

      const res = await createQueueInterpretation(
        {
          params: {
            query: {
              transaction_hash: params.transaction_hash,
              user_operation_hash: params.user_operation_hash,
            },
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      // Return if the response is 200
      res.match(
        _ => {
          toast.success("Successfully updated name.");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to update name.");
          }

          throw err;
        },
      );
    },
  });

  return {
    mutate,
    isPending,
    isSuccess,
    isError,
  };
};
