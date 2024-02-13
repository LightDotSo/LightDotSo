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

import { createQueuePortfolio } from "@lightdotso/client";
import type { QueueParams } from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast, toastMinimalLoadingStyles } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationQueuePortfolio = (params: QueueParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: queuePortfolio, failureCount } = useMutation({
    mutationFn: async () => {
      if (!params.address) {
        return;
      }

      const loadingToast = params.isMinimal
        ? toast.loading(undefined, toastMinimalLoadingStyles)
        : toast.loading("Queueing...");

      const res = await createQueuePortfolio(
        {
          params: {
            query: {
              address: params.address,
            },
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        _ => {
          if (params.isMinimal) {
            return;
          }
          toast.success("Successfully queued!");
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Failed to queue.");
          }

          throw err;
        },
      );
    },
  });

  return {
    queuePortfolio,
  };
};
