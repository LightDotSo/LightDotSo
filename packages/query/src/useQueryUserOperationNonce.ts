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

import { getUserOperationNonce } from "@lightdotso/client";
import type { UserOperationNonceData } from "@lightdotso/data";
import type { UserOperationNonceParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationNonce = (
  params: UserOperationNonceParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationNonceData | undefined =
    queryClient.getQueryData(
      queryKeys.user_operation.nonce({
        address: params.address,
        chain_id: params.chain_id,
      }).queryKey,
    );

  const {
    data: userOperationNonce,
    isLoading: isUserOperationNonceLoading,
    failureCount,
  } = useQuery<UserOperationNonceData | null>({
    queryKey: queryKeys.user_operation.nonce({
      address: params.address,
      chain_id: params.chain_id,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getUserOperationNonce(
        {
          params: {
            query: {
              address: params.address,
              chain_id: params.chain_id,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as UserOperationNonceData;
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
    userOperationNonce,
    isUserOperationNonceLoading,
  };
};
