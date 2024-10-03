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

"use client";

import {
  useMutationQueueUserOperation,
  useMutationUserOperationSendV06,
  useMutationUserOperationSendV07,
  useQueryConfiguration,
  useQueryUserOperation,
  useQueryUserOperationReceipt,
  useQueryUserOperationSignature,
} from "@lightdotso/query";
import { useReadLightWalletImageHash } from "@lightdotso/wagmi/generated";
import { useCallback, useMemo } from "react";
import type { Address, Hex } from "viem";
import { useEntryPointVersion } from "./useEntryPointVersion";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type UserOperationSendProps = {
  address: Address;
  hash: Hex;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperationSend = ({
  address,
  hash,
}: UserOperationSendProps) => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("User operation send", address, hash);
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueUserOperation, isQueueUserOperationPending } =
    useMutationQueueUserOperation({
      address: address as Address,
    });

  const { userOperation, isUserOperationLoading } = useQueryUserOperation({
    hash: hash,
  });
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("userOperation", userOperation);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isEntryPointV06, isEntryPointV07 } = useEntryPointVersion({
    address: address as Address,
    chainId: userOperation?.chain_id ?? 0,
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
    checkpoint: imageHash ? undefined : 0,
  });

  const { userOperationSignature, isUserOperationSignatureLoading } =
    useQueryUserOperationSignature({
      hash: hash,
      configuration_id: configuration?.id,
    });
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("User operation signature", userOperationSignature);

  const {
    userOperationReceipt,
    isUserOperationReceiptLoading,
    refetchUserOperationReceipt,
    userOperationReceiptErrorUpdateCount,
  } = useQueryUserOperationReceipt({
    chainId: userOperation?.chain_id ?? null,
    hash: hash,
  });

  const { userOperationSendV06, isUserOperationSendV06Pending } =
    useMutationUserOperationSendV06({
      address: address as Address,
      configuration: configuration,
      hash: userOperation?.hash as Hex,
    });

  const { userOperationSendV07, isUserOperationSendV07Pending } =
    useMutationUserOperationSendV07({
      address: address as Address,
      configuration: configuration,
      hash: userOperation?.hash as Hex,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the cumulative weight of all owners in the userOperation signatures array
  // and check if it is greater than or equal to the threshold
  const isUserOperationSendReady = useMemo(() => {
    return userOperation && userOperationSignature
      ? userOperation.signatures.reduce((acc, signature) => {
          return (
            acc +
            (configuration?.owners.find(
              (owner) => owner.id === signature?.owner_id,
            )?.weight || 0)
          );
        }, 0) >= (configuration ? configuration.threshold : 0)
      : false;
  }, [userOperation, userOperationSignature, configuration]);

  const isUserOperationSendPending = useMemo(
    () => isUserOperationSendV06Pending || isUserOperationSendV07Pending,
    [isUserOperationSendV06Pending, isUserOperationSendV07Pending],
  );

  const isUserOperationSendLoading = useMemo(
    () =>
      isQueueUserOperationPending ||
      isUserOperationSendPending ||
      isUserOperationLoading ||
      isUserOperationSignatureLoading ||
      isUserOperationReceiptLoading,
    [
      isQueueUserOperationPending,
      isUserOperationSendPending,
      isUserOperationLoading,
      isUserOperationSignatureLoading,
      isUserOperationReceiptLoading,
    ],
  );

  const isUserOperationSendSuccess = useMemo(
    () =>
      userOperation?.status === "INVALID" ||
      userOperation?.status === "EXECUTED" ||
      userOperation?.status === "REVERTED",
    [userOperation],
  );

  const isUserOperationSendValid = useMemo(
    () =>
      typeof userOperation !== "undefined" &&
      typeof userOperationSignature !== "undefined" &&
      !isUserOperationSendLoading &&
      isUserOperationSendReady,
    [
      userOperation,
      userOperationSignature,
      isUserOperationSendLoading,
      isUserOperationSendReady,
    ],
  );

  const isUserOperationSendDisabled = useMemo(
    () => !isUserOperationSendValid || isUserOperationSendSuccess,
    [isUserOperationSendValid, isUserOperationSendSuccess],
  );

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleSubmit = useCallback(() => {
    if (
      !(isUserOperationSendReady && userOperation && userOperationSignature)
    ) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("userOperation is not ready to be sent");
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Params", address, hash);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("userOperation", userOperation);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("userOperationSignature", userOperationSignature);
      return;
    }

    if (userOperationReceipt) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info(
        "User operation receipt already exists",
        userOperationReceipt,
      );
      // Queue the user operation if the user operation has been sent but isn't indexed yet
      queueUserOperation({ hash: hash });
      return;
    }

    if (userOperation.status === "PENDING") {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info("User operation is pending", userOperation);
      // Refetch the user operation receipt again
      refetchUserOperationReceipt();

      // If the user operation receipt has failed to fetch every 3 times, then return
      // This is to prevent the user operation from being sent multiple times
      if (userOperationReceiptErrorUpdateCount % 3 !== 2) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.info("User operation receipt failed to fetch");
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.info(
          "User operation receipt error update count",
          userOperationReceiptErrorUpdateCount,
        );
        return;
      }
    }

    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info("Sending userOperation w/ hash:", hash);

    // Send the user operation if the user operation hasn't been sent yet
    if (isEntryPointV06) {
      userOperationSendV06({
        userOperation: userOperation,
        userOperationSignature: userOperationSignature as Hex,
      });
    } else if (isEntryPointV07) {
      userOperationSendV07({
        userOperation: userOperation,
        userOperationSignature: userOperationSignature as Hex,
      });
    }
  }, [isUserOperationSendReady, userOperationReceipt, userOperationSignature]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    handleSubmit: handleSubmit,
    isUserOperationSendValid: isUserOperationSendValid,
    isUserOperationSendDisabled: isUserOperationSendDisabled,
    isUserOperationSendLoading: isUserOperationSendLoading,
    isUserOperationSendPending: isUserOperationSendPending,
    isUserOperationSendSuccess: isUserOperationSendSuccess,
    isUserOperationSendReady: isUserOperationSendReady,
  };
};
