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
      if (typeof params.address === "undefined") {
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
        (data) => {
          return data;
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentData ?? null;
        },
      );
    },
  });

  return {
    transactionsCount: transactionsCount,
    isTransactionsCountLoading: isTransactionsCountLoading,
  };
};
