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

import { getTokenGroup } from "@lightdotso/client";
import type { TokenGroupData } from "@lightdotso/data";
import type { TokenGroupGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryTokenGroup = (params: TokenGroupGetParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentGroupData: TokenGroupData | undefined = queryClient.getQueryData(
    queryKeys.token_group.get({
      id: params.id,
    }).queryKey,
  );

  const {
    data: tokenGroup,
    isLoading: isTokenGroupLoading,
    failureCount,
  } = useQuery<TokenGroupData | null>({
    queryKey: queryKeys.token_group.get({
      id: params.id,
    }).queryKey,
    queryFn: async () => {
      if (!params.id) {
        return null;
      }

      const res = await getTokenGroup(
        {
          params: {
            query: {
              id: params.id,
            },
          },
        },
        clientType,
      );

      return res.match(
        (data) => {
          return data as TokenGroupData;
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentGroupData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    tokenGroup: tokenGroup,
    isTokenGroupLoading: isTokenGroupLoading,
  };
};
