// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use client";

import { InvokeButton } from "@lightdotso/elements";
import {
  useMutationQueueUserOperation,
  useMutationUserOperationSend,
  useQueryUserOperation,
} from "@lightdotso/query";
import { toast } from "@lightdotso/ui";
import { useCallback } from "react";
import type { FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OpInvokeButtonProps {
  address: Address;
  userOperationHash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpInvokeButton: FC<OpInvokeButtonProps> = ({
  address,
  userOperationHash,
}) => {
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

    // queueUserOperation({ hash: userOperationHash });
  }, [userOperation, userOperationSend, queueUserOperation, userOperationHash]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <InvokeButton
      isLoading={
        isLoadingQueueUserOperation ||
        isUserOperationLoading ||
        isUserOperationSendPending
      }
      onClick={onClick}
    />
  );
};
