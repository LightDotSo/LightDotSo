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
import { type Hex, type Address } from "viem";

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
  console.info("User operation send", address, hash);

  const { queueUserOperation, isQueueUserOperationPending } =
    useMutationQueueUserOperation({ address });
  const { userOperation, isUserOperationLoading } = useQueryUserOperation({
    hash,
  });
  const { data: imageHash } = useReadLightWalletImageHash({
    address: (userOperation?.sender as Address) ?? "0x",
    chainId: userOperation?.chain_id,
  });
  const { configuration } = useQueryConfiguration({
    address,
    image_hash: imageHash,
    checkpoint: !imageHash ? 0 : undefined,
  });
  const { userOperationSignature, isUserOperationSignatureLoading } =
    useQueryUserOperationSignature({
      hash,
      configuration_id: configuration?.id,
    });
  const {
    userOperationReceipt,
    isUserOperationReceiptLoading,
    refetchUserOperationReceipt,
  } = useQueryUserOperationReceipt({
    chainId: userOperation?.chain_id ?? 0,
    hash,
  });

  const { userOperationSend, isUserOperationSendPending } =
    useMutationUserOperationSend({
      address,
      configuration,
      hash: (userOperation?.hash as Hex) ?? "0x",
    });

  const isUserOperationSendReady = useMemo(
    () =>
      userOperation && userOperationSignature
        ? userOperation.signatures.reduce(
            (acc, signature) =>
              acc +
              (configuration?.owners.find(
                owner => owner.id === signature?.owner_id,
              )?.weight || 0),
            0,
          ) >= (configuration ? configuration.threshold : 0)
        : false,
    [userOperation, userOperationSignature, configuration],
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

  const isUserOperationSendValid = useMemo(
    () =>
      userOperation &&
      userOperationSignature &&
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
    () => !isUserOperationSendValid,
    [isUserOperationSendValid],
  );

  const handleSubmit = useCallback(() => {
    if (
      !isUserOperationSendReady ||
      !userOperation ||
      !userOperationSignature
    ) {
      console.error(
        "User operation is not ready to be sent or data is missing",
      );
      return;
    }

    if (userOperationReceipt) {
      console.info(
        "User operation receipt already exists",
        userOperationReceipt,
      );
      queueUserOperation({ hash });
      return;
    }

    if (userOperation.status === "PENDING") {
      console.info("User operation is pending", userOperation);
      refetchUserOperationReceipt();
      return;
    }

    console.info("Sending user operation", hash);
    // @ts-ignore
    userOperationSend({ userOperation, userOperationSignature });
  }, [
    isUserOperationSendReady,
    userOperation,
    userOperationSignature,
    userOperationReceipt,
    refetchUserOperationReceipt,
    userOperationSend,
    queueUserOperation,
  ]);

  return {
    handleSubmit,
    isUserOperationSendValid,
    isUserOperationSendDisabled,
    isUserOperationSendLoading,
    isUserOperationSendPending,
    isUserOperationSendReady,
  };
};
