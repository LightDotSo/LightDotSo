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

import { getUserOperationReceipt } from "@lightdotso/client";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationReceipt = (
  params: Pick<UserOperation, "hash"> & { chainId: number },
) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: userOperationReceipt,
    isLoading: isUserOperationReceiptLoading,
    isError: isUserOperationReceiptError,
    error: userOperationReceiptError,
  } = useQuery({
    retry: false,
    queryKey: queryKeys.rpc.get_user_operation_receipt({
      chainId: params.chainId,
      hash: params.hash,
    }).queryKey,
    queryFn: async () => {
      const res = await getUserOperationReceipt(
        params.chainId,
        [params.hash],
        clientType,
      );

      // Throw error if there is an error
      return res._unsafeUnwrap();
    },
  });

  return {
    userOperationReceipt: userOperationReceipt,
    isUserOperationReceiptLoading: isUserOperationReceiptLoading,
    isUserOperationReceiptError: isUserOperationReceiptError,
    userOperationReceiptError: userOperationReceiptError,
  };
};
