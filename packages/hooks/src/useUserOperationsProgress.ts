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
    // Filter out incomplete partial user operations
    const completePartialUserOperations = partialUserOperations.filter(
      (op) =>
        typeof op.chainId !== "undefined" &&
        typeof op.callData !== "undefined" &&
        typeof op.nonce !== "undefined",
    );

    // Deduplicate partial user operations against user operations
    const uniquePartialUserOperations = completePartialUserOperations.filter(
      (partialUserOperation) =>
        !userOperations.some(
          (userOperation) =>
            userOperation.chainId === partialUserOperation.chainId &&
            userOperation.callData === partialUserOperation.callData &&
            userOperation.nonce === partialUserOperation.nonce,
        ),
    );

    // Combine unique partial user operations with user operations
    return [...uniquePartialUserOperations, ...userOperations];
  }, [partialUserOperations, userOperations]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { progressUserOperations: progressUserOperations };
};
