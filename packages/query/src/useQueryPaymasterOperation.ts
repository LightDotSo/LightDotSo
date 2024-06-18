// Copyright 2023-2024 Light, Inc.
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

import { getPaymasterOperation } from "@lightdotso/client";
import type { PaymasterOperationData } from "@lightdotso/data";
import type { PaymasterOperationGetParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryPaymasterOperation = (
  params: PaymasterOperationGetParams,
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: PaymasterOperationData | undefined =
    queryClient.getQueryData(
      queryKeys.paymaster_operation.get({
        address: params.address,
        chain_id: params.chain_id,
        valid_after: params.valid_after,
      }).queryKey,
    );

  const { data: paymasterOperation, failureCount } =
    useQuery<PaymasterOperationData | null>({
      queryKey: queryKeys.paymaster_operation.get({
        address: params.address,
        chain_id: params.chain_id,
        valid_after: params.valid_after,
      }).queryKey,
      queryFn: async () => {
        if (!params.address) {
          return null;
        }

        const res = await getPaymasterOperation(
          {
            params: {
              query: {
                address: params.address ?? undefined,
                chain_id: params.chain_id,
                valid_after: params.valid_after,
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
    paymasterOperation: paymasterOperation,
  };
};
