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
  useQueryUserOperation,
} from "@lightdotso/query";
import { FooterButton } from "@lightdotso/templates";
import { toast } from "@lightdotso/ui";
import { useRouter } from "next/navigation";
import { useCallback, type FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalInterceptionFooterProps {
  address: Address;
  userOperationHash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC<ModalInterceptionFooterProps> = ({
  address,
  userOperationHash,
}) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueUserOperation, isLoadingQueueUserOperation } =
    useMutationQueueUserOperation({
      address: userOperationHash,
    });

  const { userOperation, isUserOperationLoading } = useQueryUserOperation({
    hash: userOperationHash,
  });

  const { userOperationSend, isUserOperationSendPending } =
    useMutationUserOperationSend({
      address,
      chain_id: userOperation?.chain_id,
    });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onClick = useCallback(async () => {
    if (!userOperation) {
      toast.error("User operation not found.");
      return;
    }

    await userOperationSend(userOperation);

    queueUserOperation({ hash: userOperationHash });
  }, [userOperation, userOperationSend, queueUserOperation, userOperationHash]);

  const onDismiss = useCallback(() => {
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      disabled={
        isLoadingQueueUserOperation ||
        isUserOperationLoading ||
        isUserOperationSendPending ||
        (userOperation?.status !== "PROPOSED" &&
          userOperation?.status !== "PENDING")
      }
      isLoading={
        isLoadingQueueUserOperation ||
        isUserOperationSendPending ||
        isUserOperationLoading
      }
      customSuccessText="Refresh"
      cancelClick={onDismiss}
      onClick={onClick}
    />
  );
};
