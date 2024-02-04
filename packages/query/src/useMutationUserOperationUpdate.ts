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

import { updateUserOperation } from "@lightdotso/client";
import type {
  UserOperationParams,
  UserOperationUpdateBodyParams,
} from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationUserOperationUpdate = (params: UserOperationParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const { mutate: logout } = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: async (_body: UserOperationUpdateBodyParams) => {
      const loadingToast = toast.loading("Updating operation...");

      const res = await updateUserOperation(
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
          toast.success("Successfully updated operations!");
        },
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
    logout,
  };
};
