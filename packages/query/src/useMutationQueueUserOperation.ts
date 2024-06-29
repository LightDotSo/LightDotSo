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

import { createQueueUserOperation } from "@lightdotso/client";
import type {
  QueueParams,
  QueueUserOpeartionBodyParams,
} from "@lightdotso/params";
import { useAuth } from "@lightdotso/stores";
import { toast, toastMinimalLoadingStyles } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationQueueUserOperation = (params: QueueParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: queueUserOperation,
    isPending: isLoadingQueueUserOperation,
    failureCount,
  } = useMutation({
    mutationFn: async (body: QueueUserOpeartionBodyParams) => {
      if (!params.address) {
        return;
      }

      const loadingToast = params.isMinimal
        ? toast.loading(undefined, toastMinimalLoadingStyles)
        : toast.loading("Queueing...");

      const res = await createQueueUserOperation(
        {
          params: {
            query: {
              hash: body.hash,
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
          toast.success("Successfully queued user operation!");
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
    queueUserOperation: queueUserOperation,
    isLoadingQueueUserOperation: isLoadingQueueUserOperation,
  };
};
