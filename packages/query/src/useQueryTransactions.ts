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

import { getTransactions } from "@lightdotso/client";
import type { TransactionData } from "@lightdotso/data";
import type { TransactionListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useQueryTransactions = (params: TransactionListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TransactionData[] | undefined = queryClient.getQueryData(
    queryKeys.transaction.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      is_testnet: params.is_testnet,
    }).queryKey,
  );

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    failureCount,
  } = useQuery<TransactionData[] | null>({
    queryKey: queryKeys.transaction.list({
      address: params.address,
      limit: params.limit,
      offset: params.offset,
      is_testnet: params.is_testnet,
    }).queryKey,
    queryFn: async () => {
      if (typeof params.address === "undefined") {
        return null;
      }

      const res = await getTransactions(
        {
          params: {
            query: {
              address: params.address ?? undefined,
              limit: params.limit,
              offset: params.offset,
              is_testnet: params.is_testnet,
            },
          },
        },
        clientType,
      );

      return res.match(
        data => {
          return data as TransactionData[];
        },
        err => {
          if (err instanceof Error && failureCount % 3 !== 2) {
            throw err;
          }
          return currentData ?? null;
        },
      );
    },
  });

  return {
    transactions,
    isTransactionsLoading,
  };
};
