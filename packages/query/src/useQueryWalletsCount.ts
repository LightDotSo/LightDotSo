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

import { getWalletsCount } from "@lightdotso/client";
import type { WalletCountData } from "@lightdotso/data";
import type { WalletListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";

export const useQueryWalletsCount = (params: WalletListCountParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentCountData: WalletCountData | undefined =
    queryClient.getQueryData(
      queryKeys.wallet.listCount({ address: params.address as Address })
        .queryKey,
    );

  const { data: walletsCount } = useQuery<WalletCountData | null>({
    queryKey: queryKeys.wallet.listCount({ address: params.address as Address })
      .queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getWalletsCount(
        {
          params: {
            query: {
              owner: params.address,
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
          return currentCountData ?? null;
        },
      );
    },
  });

  return {
    walletsCount,
  };
};
