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

import { getUserOperationSignature } from "@lightdotso/client";
import type { UserOperationSignatureData } from "@lightdotso/data";
import type { UserOperationSignatureGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationSignature = (
  params: UserOperationSignatureGetParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationSignatureData | undefined =
    queryClient.getQueryData(
      queryKeys.user_operation.signature({
        hash: params.hash,
        configuration_id: params.configuration_id,
      }).queryKey,
    );

  const {
    data: userOperationSignature,
    isLoading: isUserOperationSignatureLoading,
    failureCount,
  } = useQuery<UserOperationSignatureData | null>({
    queryKey: queryKeys.user_operation.signature({
      hash: params.hash,
      configuration_id: params.configuration_id,
    }).queryKey,
    queryFn: async () => {
      if (!params.hash) {
        return null;
      }

      const res = await getUserOperationSignature(
        {
          params: {
            query: {
              user_operation_hash: params.hash,
              configuration_id: params.configuration_id,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as UserOperationSignatureData;
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
    userOperationSignature: userOperationSignature,
    isUserOperationSignatureLoading: isUserOperationSignatureLoading,
  };
};
