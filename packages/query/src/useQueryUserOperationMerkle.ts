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

import { getUserOperationMerkle } from "@lightdotso/client";
import type { UserOperationMerkleData } from "@lightdotso/data";
import type { UserOperationMerkleGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationMerkle = (
  params: UserOperationMerkleGetParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationMerkleData | undefined =
    queryClient.getQueryData(
      queryKeys.user_operation_merkle.get({
        root: params.root,
      }).queryKey,
    );

  const {
    data: userOperationMerkle,
    isLoading: isUserOperationMerkleLoading,
    refetch: refetchUserOperationMerkle,
    failureCount,
  } = useQuery<UserOperationMerkleData | null>({
    queryKey: queryKeys.user_operation_merkle.get({
      root: params.root,
    }).queryKey,
    queryFn: async () => {
      if (!params.root) {
        return null;
      }

      const res = await getUserOperationMerkle(
        {
          params: {
            query: {
              root: params.root,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as UserOperationMerkleData;
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
    userOperationMerkle: userOperationMerkle,
    isUserOperationMerkleLoading: isUserOperationMerkleLoading,
    refetchUserOperationMerkle: refetchUserOperationMerkle,
  };
};
