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

import {
  useMutationQueueUserOperation,
  useMutationUserOperationSend,
  useQueryConfiguration,
  useQueryUserOperation,
  useQueryUserOperationReceipt,
} from "@lightdotso/query";
import { useFormRef } from "@lightdotso/stores";
import { useReadLightWalletImageHash } from "@lightdotso/wagmi";
import { useCallback, useEffect, useMemo } from "react";
import type { Hex, Address } from "viem";
import { useDelayedValue } from "./useDelayedValue";

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
  // Stores
  // ---------------------------------------------------------------------------

  const { setCustomFormSuccessText } = useFormRef();

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

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: imageHash } = useReadLightWalletImageHash({
    address: userOperation?.sender as Address,
    chainId: userOperation?.chain_id ?? undefined,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address as Address,
    image_hash: imageHash,
    checkpoint: !imageHash ? 0 : undefined,
  });

  const { userOperationReceipt } = useQueryUserOperationReceipt({
    chainId: userOperation?.chain_id!,
    hash: hash,
  });

  const {
    userOperationSend,
    isUserOperationSendSuccess: isMutationUserOperationSendSuccess,
    isUserOperationSendPending: isMutationUserOperationSendLoading,
  } = useMutationUserOperationSend({
    address: address as Address,
    configuration: configuration,
    hash: userOperation?.hash as Hex,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const delayedIsSuccess = useDelayedValue<boolean>(
    isMutationUserOperationSendSuccess,
    false,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const formStateText = useMemo(() => {
    if (isMutationUserOperationSendLoading) {
      return "Sending transaction...";
    }

    if (delayedIsSuccess) {
      return "Success";
    }

    return "Send";
  }, [address, delayedIsSuccess, isMutationUserOperationSendLoading]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the custom form success text
  useEffect(() => {
    if (!formStateText) {
      return;
    }
    setCustomFormSuccessText(formStateText);
  }, [formStateText, setCustomFormSuccessText]);

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

    if (userOperationReceipt) {
      if (!isUserOperationSendPending) {
        // Queue the user operation if the user operation has been sent but isn't indexed yet
        await queueUserOperation({ hash: hash });
        // Finally, return
        return;
      }
    } else {
      // Send the user operation if the user operation hasn't been sent yet
      await userOperationSend(userOperation);
      // Finally, refetch the user operation
      await refetchUserOperation();
    }
  }, [
    userOperation,
    userOperationReceipt,
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
