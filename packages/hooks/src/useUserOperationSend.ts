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
import { toast } from "@lightdotso/ui";
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

  const { userOperation, isUserOperationLoading, refetchUserOperation } =
    useQueryUserOperation({
      hash: hash,
    });

  const { userOperationSend, isUserOperationSendPending } =
    useMutationUserOperationSend({
      address,
      chain_id: userOperation?.chain_id,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isUserOperationSendDisabled = useMemo(
    () =>
      userOperation?.status !== "PROPOSED" &&
      userOperation?.status !== "PENDING",
    [userOperation],
  );

  const isUserOperationSendLoading = useMemo(
    () => isUserOperationLoading || isUserOperationSendPending,
    [isUserOperationLoading, isUserOperationSendPending],
  );

  const isUserOperationSendSuccess = useMemo(
    () =>
      userOperation?.status === "EXECUTED" ||
      userOperation?.status === "REVERTED",
    [userOperation],
  );

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    if (!userOperation) {
      toast.error("User operation not found.");
      return;
    }

    if (!isUserOperationSendDisabled) {
      await userOperationSend(userOperation);
    }

    const res = await getUserOperationReceipt(userOperation.chain_id, [
      userOperation.hash,
    ]);

    res.match(
      () => {
        // Refetch the user operation on success
        if (!isUserOperationSendDisabled) {
          refetchUserOperation();
        }
      },
      _ => {
        queueUserOperation({ hash: hash });
      },
    );
  }, [
    userOperation,
    isUserOperationSendDisabled,
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
    userOperation,
    isUserOperationSendDisabled: isUserOperationSendDisabled,
    isUserOperationSendLoading: isUserOperationSendLoading,
    isUserOperationSendSuccess: isUserOperationSendSuccess,
  };
};
