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

import { createQueueTransaction } from "@lightdotso/client";
import type {
  QueueMinimalParams,
  QueueTransactionBodyParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast, toastMinimalLoadingStyles } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationQueueTransaction = (params: QueueMinimalParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: queueTransaction,
    isPending: isQueueTransactionPending,
    failureCount,
  } = useMutation({
    mutationKey: queryKeys.queue.transaction._def,
    mutationFn: async (body: QueueTransactionBodyParams) => {
      const loadingToast = params.isMinimal
        ? toast.loading(undefined, toastMinimalLoadingStyles)
        : toast.loading("Queueing...");

      const res = await createQueueTransaction(
        {
          params: {
            query: {
              chain_id: body.chain_id,
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
          toast.success("Successfully queued transaction!");
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
    queueTransaction: queueTransaction,
    isQueueTransactionPending: isQueueTransactionPending,
  };
};
