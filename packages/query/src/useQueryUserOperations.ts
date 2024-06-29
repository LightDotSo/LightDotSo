// Copyright 2023-2024 Light.
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

import { getUserOperations } from "@lightdotso/client";
import type { UserOperationData } from "@lightdotso/data";
import type { UserOperationListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperations = (params: UserOperationListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queryKeys.user_operation.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      chain_id: params.chain_id,
      is_testnet: params.is_testnet,
      status: params.status,
      order: params.order,
    }).queryKey,
  );

  const {
    data: userOperations,
    isLoading: isUserOperationsLoading,
    refetch: refetchUserOperations,
    failureCount,
  } = useQuery<UserOperationData[] | null>({
    queryKey: queryKeys.user_operation.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      chain_id: params.chain_id,
      is_testnet: params.is_testnet,
      status: params.status,
      order: params.order,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.address === "undefined") {
        return null;
      }

      const res = await getUserOperations(
        {
          params: {
            query: {
              address: params.address ?? undefined,
              limit: params.limit,
              offset: params.offset,
              chain_id: params.chain_id,
              is_testnet: params.is_testnet,
              status: params.status,
              order: params.order,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as UserOperationData[];
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
    userOperations: userOperations,
    isUserOperationsLoading: isUserOperationsLoading,
    refetchUserOperations: refetchUserOperations,
  };
};
