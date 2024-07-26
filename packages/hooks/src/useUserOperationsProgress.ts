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

import type { UserOperation } from "@lightdotso/schemas";
import { useUserOperations } from "@lightdotso/stores";
import { useMemo } from "react";

export const useUserOperationsProgress = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { partialUserOperations, userOperations } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const progressUserOperations: Partial<UserOperation>[] = useMemo(() => {
    // Return the concatenated partial user operations and user operations
    // to display the transaction details.
    // However, filter out the operations that are the same chainId and nonce

    const incompletePartialUserOperations = partialUserOperations.filter(
      (partialUserOperation) =>
        typeof partialUserOperation.chainId === "undefined" ||
        typeof partialUserOperation.callData === "undefined" ||
        typeof partialUserOperation.nonce === "undefined",
    );

    const duplicatePartialUserOperations = partialUserOperations.filter(
      (partialUserOperation) =>
        userOperations.some(
          (userOperation) =>
            (userOperation.chainId === partialUserOperation.chainId &&
              userOperation.callData === partialUserOperation.callData) ||
            (userOperation.chainId === partialUserOperation.chainId &&
              userOperation.nonce === partialUserOperation.nonce) ||
            (userOperation.chainId === partialUserOperation.chainId &&
              (typeof partialUserOperation.nonce === "undefined" ||
                partialUserOperation.nonce === null)),
        ),
    );

    // Remove the duplicate partial user operations from the partial user operations
    // to prevent duplicate transaction details.
    const filteredPartialUserOperations = partialUserOperations.filter(
      (partialUserOperation) =>
        !incompletePartialUserOperations.includes(partialUserOperation) ||
        !duplicatePartialUserOperations.includes(partialUserOperation),
    );

    return [...filteredPartialUserOperations, ...userOperations];
  }, [partialUserOperations, userOperations]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { progressUserOperations: progressUserOperations };
};
