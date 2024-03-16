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

"use client";

import { getUserOperationReceipt } from "@lightdotso/client";
import {
  useMutationQueueUserOperation,
  useMutationUserOperationSend,
  useQueryUserOperation,
} from "@lightdotso/query";
import { useCallback, useMemo } from "react";
import type { Hex, Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationSendProps = {
  address: Address;
  hash: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationSend = ({
  address,
  hash,
}: UserOperationSendProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueUserOperation } = useMutationQueueUserOperation({
    address: hash,
  });

  const { userOperation, isUserOperationFetching, refetchUserOperation } =
    useQueryUserOperation({
      hash: hash,
    });

  const {
    userOperationSend,
    isUserOperationSendPending: isMutationUserOperationSendLoading,
  } = useMutationUserOperationSend({
    address,
    chain_id: userOperation?.chain_id,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isUserOperationSendPending = useMemo(
    () =>
      userOperation
        ? userOperation?.status === "PROPOSED" ||
          userOperation?.status === "PENDING"
        : // Send is pending if the operation is not found
          true,
    [userOperation],
  );

  const isUserOperationReloading = useMemo(
    () => isUserOperationFetching,
    [isUserOperationFetching],
  );

  const isUserOperationSendLoading = useMemo(
    () => isMutationUserOperationSendLoading,
    [isMutationUserOperationSendLoading],
  );

  const isUserOperationSendDisabled = useMemo(
    () =>
      userOperation?.status === "INVALID" ||
      userOperation?.status === "EXECUTED" ||
      userOperation?.status === "REVERTED",
    [userOperation],
  );

  const isUserOperationSendSuccess = isUserOperationSendDisabled;

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    if (!userOperation) {
      return;
    }

    // Get the user operation receipt to check if the user operation has been sent directly
    const res = await getUserOperationReceipt(userOperation.chain_id, [
      userOperation.hash,
    ]);

    res.match(
      async () => {
        if (!isUserOperationSendPending) {
          // Queue the user operation if the user operation has been sent but isn't indexed yet
          await queueUserOperation({ hash: hash });
        }
      },
      async _ => {
        // Send the user operation if the user operation hasn't been sent yet
        await userOperationSend(userOperation);
      },
    );
    // Finally, refetch the user operation
    await refetchUserOperation();
  }, [
    userOperation,
    isUserOperationSendPending,
    userOperationSend,
    queueUserOperation,
    refetchUserOperation,
    hash,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    handleSubmit,
    refetchUserOperation,
    userOperation,
    isUserOperationReloading: isUserOperationReloading,
    isUserOperationSendPending: isUserOperationSendPending,
    isUserOperationSendDisabled: isUserOperationSendDisabled,
    isUserOperationSendLoading: isUserOperationSendLoading,
    isUserOperationSendSuccess: isUserOperationSendSuccess,
  };
};
