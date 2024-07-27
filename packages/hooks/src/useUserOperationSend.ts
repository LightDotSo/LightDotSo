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
  useMutationUserOperationSend,
  useQueryConfiguration,
  useQueryUserOperation,
  useQueryUserOperationReceipt,
  useQueryUserOperationSignature,
} from "@lightdotso/query";
import { useReadLightWalletImageHash } from "@lightdotso/wagmi";
import { useCallback, useMemo } from "react";
import type { Address, Hex } from "viem";

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
  console.info("User operation", userOperation);

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
  console.info("User operation signature", userOperationSignature);

  // const { paymasterOperation } = useQueryPaymasterOperation({
  //   address: userOperation?.paymaster_and_data.slice(0, 42) as Address,
  //   // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
  //   chain_id: userOperation?.chain_id!,
  //   valid_until: fromHex(
  //     `0x${userOperation?.paymaster_and_data ? userOperation?.paymaster_and_data.slice(154, 162) : 0}`,
  //     "number",
  //   ),
  //   valid_after: fromHex(
  //     `0x${userOperation?.paymaster_and_data ? userOperation?.paymaster_and_data.slice(162, 170) : 0}`,
  //     "number",
  //   ),
  // });

  const {
    userOperationReceipt,
    isUserOperationReceiptLoading,
    refetchUserOperationReceipt,
    userOperationReceiptErrorUpdateCount,
  } = useQueryUserOperationReceipt({
    chainId: userOperation?.chain_id ?? null,
    hash: hash,
  });

  const { userOperationSend, isUserOperationSendPending } =
    useMutationUserOperationSend({
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
      console.error("User operation is not ready to be sent");
      console.error("Params", address, hash);
      console.error("User operation", userOperation);
      console.error("User operation signature", userOperationSignature);
      return;
    }

    if (userOperationReceipt) {
      console.info(
        "User operation receipt already exists",
        userOperationReceipt,
      );
      // Queue the user operation if the user operation has been sent but isn't indexed yet
      queueUserOperation({ hash: hash });
      return;
    }

    if (userOperation.status === "PENDING") {
      console.info("User operation is pending", userOperation);
      // Refetch the user operation receipt again
      refetchUserOperationReceipt();

      // If the user operation receipt has failed to fetch every 3 times, then return
      // This is to prevent the user operation from being sent multiple times
      if (userOperationReceiptErrorUpdateCount % 3 !== 2) {
        console.info("User operation receipt failed to fetch");
        console.info(
          "User operation receipt error update count",
          userOperationReceiptErrorUpdateCount,
        );
        return;
      }
    }

    console.info("Sending user operation", hash);
    // Send the user operation if the user operation hasn't been sent yet
    userOperationSend({
      userOperation: userOperation,
      userOperationSignature: userOperationSignature as Hex,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
