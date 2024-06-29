// Copyright 2023-2024 Light.
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

import { getWalletBilling } from "@lightdotso/client";
import type { WalletBillingData } from "@lightdotso/data";
import type { WalletBillingParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryWalletBilling = (params: WalletBillingParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletBillingData | undefined = queryClient.getQueryData(
    queryKeys.wallet.billing({ address: params.address }).queryKey,
  );

  const {
    data: walletBilling,
    isLoading: isWalletBillingLoading,
    refetch: refetchWalletBilling,
    failureCount,
  } = useQuery<WalletBillingData | null>({
    queryKey: queryKeys.wallet.billing({ address: params.address }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getWalletBilling(
        {
          params: {
            query: {
              address: params.address,
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
    walletBilling: walletBilling,
    isWalletBillingLoading: isWalletBillingLoading,
    refetchWalletBilling: refetchWalletBilling,
  };
};
