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

import { getWallets } from "@lightdotso/client";
import type { WalletData } from "@lightdotso/data";
import type { WalletListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useQueryWallets = (params: WalletListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletData[] | undefined = queryClient.getQueryData(
    queryKeys.wallet.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
    }).queryKey,
  );

  const { data: wallets } = useQuery<WalletData[] | null>({
    queryKey: queryKeys.wallet.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
    }).queryKey,
    queryFn: async () => {
      if (params.address === null) {
        return null;
      }

      const res = await getWallets(
        {
          params: {
            query: {
              owner: params.address,
              limit: params.limit,
              offset: params.offset,
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
    wallets,
  };
};
