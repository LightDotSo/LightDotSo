// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { getTokenPrice } from "@lightdotso/client";
import type { TokenPriceData } from "@lightdotso/data";
import type { TokenPriceParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";

export const useSuspenseQueryTokenPrice = (params: TokenPriceParams) => {
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

  const { data: token_price } = useSuspenseQuery<TokenPriceData | null>({
    queryKey: queryKeys.token_price.get({
      address: params.address,
      chain_id: params.chain_id,
    }).queryKey,
    queryFn: async () => {
      if (params.address === null) {
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

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return {
    token_price,
  };
};
