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

import { getToken } from "@lightdotso/client";
import type { TokenData } from "@lightdotso/data";
import type { TokenGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryToken = (params: TokenGetParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TokenData | undefined = queryClient.getQueryData(
    queryKeys.token.get({
      address: params.address,
      chain_id: params.chain_id,
      wallet: params.wallet,
    }).queryKey,
  );

  const {
    data: token,
    isLoading: isTokenLoading,
    failureCount,
  } = useQuery<TokenData | null>({
    queryKey: queryKeys.token.get({
      address: params.address,
      chain_id: params.chain_id,
      wallet: params.wallet,
    }).queryKey,
    queryFn: async () => {
      if (!params.address || !params.chain_id) {
        return null;
      }

      const res = await getToken(
        {
          params: {
            query: {
              address: params.address,
              chain_id: params.chain_id,
              wallet: params.wallet,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as TokenData;
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
    token: token,
    isTokenLoading: isTokenLoading,
  };
};
