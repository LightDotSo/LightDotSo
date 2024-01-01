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

import { getTransactionsCount } from "@lightdotso/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionCountData } from "@/data";
import type { TransactionListCountParams } from "@/params";
import { queryKeys } from "@/queryKeys";
import { useAuth } from "@/stores";

export const useQueryTransactionsCount = (
  params: TransactionListCountParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TransactionCountData | undefined =
    queryClient.getQueryData(
      queryKeys.transaction.listCount({
        address: params.address,
        is_testnet: params.is_testnet,
      }).queryKey,
    );

  const { data: transactionsCount } = useQuery<TransactionCountData | null>({
    queryKey: queryKeys.transaction.listCount({
      address: params.address,
      is_testnet: params.is_testnet,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getTransactionsCount(
        {
          params: {
            query: {
              address: params.address,
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
    transactionsCount,
  };
};
