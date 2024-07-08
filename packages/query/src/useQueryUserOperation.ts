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

import { getUserOperation } from "@lightdotso/client";
import type { UserOperationData } from "@lightdotso/data";
import type { UserOperationGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperation = (params: UserOperationGetParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationData | undefined = queryClient.getQueryData(
    queryKeys.user_operation.get({
      hash: params.hash,
    }).queryKey,
  );

  const {
    data: userOperation,
    isLoading: isUserOperationLoading,
    refetch: refetchUserOperation,
    failureCount,
  } = useQuery<UserOperationData | null>({
    queryKey: queryKeys.user_operation.get({
      hash: params.hash,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.hash === "undefined") {
        return null;
      }

      const res = await getUserOperation(
        {
          params: {
            query: {
              user_operation_hash: params.hash,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as UserOperationData;
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
    userOperation: userOperation,
    isUserOperationLoading: isUserOperationLoading,
    refetchUserOperation: refetchUserOperation,
  };
};
