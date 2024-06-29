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

import { getTokenPrice } from "@lightdotso/client";
import type { TokenPriceData } from "@lightdotso/data";
import type { TokenPriceParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isTestnet } from "../../utils/src";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryTokenPrice = (params: TokenPriceParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TokenPriceData | undefined = queryClient.getQueryData(
    queryKeys.token_price.get({
      address: params.address,
      chain_id: params.chain_id,
    }).queryKey,
  );

  const { data: token_price, failureCount } = useQuery<TokenPriceData | null>({
    queryKey: queryKeys.token_price.get({
      address: params.address,
      chain_id: params.chain_id,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      if (isTestnet(params.chain_id)) {
        return null;
      }

      const res = await getTokenPrice(
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
          return data;
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
    token_price: token_price,
  };
};
