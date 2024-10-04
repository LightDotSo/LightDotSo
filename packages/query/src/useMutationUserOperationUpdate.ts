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

import { updateUserOperation } from "@lightdotso/client";
import type { UserOperationParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui/components/toast";
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

  const {
    mutate: userOperationUpdate,
    isPending: isUserOperationUpdatePending,
    failureCount,
  } = useMutation({
    mutationKey: queryKeys.user_operation.update._def,
    mutationFn: async () => {
      if (!params.address) {
        return;
      }

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
        (_) => {
          toast.success("Successfully updated operations!");
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

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

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isUserOperationUpdatePending: isUserOperationUpdatePending,
    userOperationUpdate: userOperationUpdate,
  };
};
