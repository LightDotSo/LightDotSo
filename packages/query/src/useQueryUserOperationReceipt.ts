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

import { getUserOperationReceipt } from "@lightdotso/client";
import { queryKeys } from "@lightdotso/query-keys";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import { useQuery } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryUserOperationReceipt = (
  params: Pick<UserOperation, "hash"> & { chainId: number | null },
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
    refetch: refetchUserOperationReceipt,
  } = useQuery({
    // The user operation receipt is used for subsequent operations like sending and queuing.
    retry: false,
    queryKey: queryKeys.rpc.get_user_operation_receipt({
      chainId: Number(params.chainId),
      hash: params.hash,
    }).queryKey,
    queryFn: async () => {
      // If no `chainId` or `hash` is provided, return null
      if (!params.chainId || !params.hash) {
        return null;
      }

      // Get the user operation receipt
      const res = await getUserOperationReceipt(
        Number(params.chainId),
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
    refetchUserOperationReceipt: refetchUserOperationReceipt,
  };
};
