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
import type { TransactionCountData } from "@lightdotso/data";
import type { TransactionListCountParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

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

  const {
    data: transactionsCount,
    isLoading: isTransactionsCountLoading,
    failureCount,
  } = useQuery<TransactionCountData | null>({
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
              address: params.address ?? undefined,
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
    transactionsCount,
    isTransactionsCountLoading,
  };
};
