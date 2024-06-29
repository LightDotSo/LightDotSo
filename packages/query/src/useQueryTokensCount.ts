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

import { getTokensCount } from "@lightdotso/client";
import type { TokenCountData } from "@lightdotso/data";
import type { TokenListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryTokensCount = (params: TokenListCountParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentCountData: TokenCountData | undefined = queryClient.getQueryData(
    queryKeys.token.listCount({
      address: params.address as Address,
      is_testnet: params.is_testnet,
      chain_ids: null,
    }).queryKey,
  );

  const {
    data: tokensCount,
    isLoading: isTokensCountLoading,
    failureCount,
  } = useQuery<TokenCountData | null>({
    queryKey: queryKeys.token.listCount({
      address: params.address as Address,
      is_testnet: params.is_testnet,
      chain_ids: null,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getTokensCount(
        {
          params: {
            query: {
              address: params.address,
              is_testnet: params.is_testnet,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data;
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentCountData ?? null;
        },
      );
    },
  });

  return {
    tokensCount: tokensCount,
    isTokensCountLoading: isTokensCountLoading,
  };
};
