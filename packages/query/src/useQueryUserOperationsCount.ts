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

import { getUserOperationsCount } from "@lightdotso/client";
import type { UserOperationCountData } from "@lightdotso/data";
import type { UserOperationListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationsCount = (
  params: UserOperationListCountParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentCountData: UserOperationCountData | undefined =
    queryClient.getQueryData(
      queryKeys.user_operation.listCount({
        address: params.address as Address,
        status: params.status,
        is_testnet: params.is_testnet,
      }).queryKey,
    );

  const {
    data: userOperationsCount,
    isLoading: isUserOperationsCountLoading,
    refetch: refetchUserOperationsCount,
    failureCount,
  } = useQuery<UserOperationCountData | null>({
    queryKey: queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: params.status,
      is_testnet: params.is_testnet,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.address === "undefined") {
        return null;
      }

      const res = await getUserOperationsCount(
        {
          params: {
            query: {
              address: params.address ?? undefined,
              status: params.status,
              is_testnet: params.is_testnet,
            },
          },
        },
        clientType,
      );

      return res.match(
        (data) => {
          return data;
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentCountData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    userOperationsCount: userOperationsCount,
    isUserOperationsCountLoading: isUserOperationsCountLoading,
    refetchUserOperationsCount: refetchUserOperationsCount,
  };
};
