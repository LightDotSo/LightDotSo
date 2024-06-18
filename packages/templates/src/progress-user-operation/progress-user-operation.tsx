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

import { useUserOperationSend } from "@lightdotso/hooks";
import {
  useQueryUserOperation,
  useQueryUserOperations,
} from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { type FC, useEffect, useState } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PendingUserOperationOpProps = {
  hash: Hex;
  onExecuted: () => void;
};

// -----------------------------------------------------------------------------
// Internal Component
// -----------------------------------------------------------------------------

export const ProgressUserOperationOp: FC<PendingUserOperationOpProps> = ({
  hash,
  onExecuted,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperation, refetchUserOperation } = useQueryUserOperation({
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { handleSubmit } = useUserOperationSend({
    address: userOperation?.sender as Address,
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Refetch user operation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUserOperation();
      handleSubmit();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Display a `toast.success` when the user operation is executed
  useEffect(() => {
    if (userOperation && userOperation.status === "EXECUTED") {
      toast.dismiss(hash);

      toast.success("Transaction executed!", {
        position: "top-right",
      });

      // Refetch all pending user operations upon execution
      onExecuted();
    }
  }, [hash, userOperation, onExecuted]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ProgressUserOperation: FC = () => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [hashedToasts, setHashedToasts] = useState(new Set());

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    userOperations: pendingUserOperations,
    isUserOperationsLoading: isPendingUserOperationsLoading,
    refetchUserOperations: refetchPendingUserOperations,
  } = useQueryUserOperations({
    address: wallet,
    status: "pending",
    order: "desc",
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    is_testnet: true,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Issue a `toast.info` for each pending user operation
  useEffect(() => {
    if (!pendingUserOperations || isPendingUserOperationsLoading) {
      return;
    }

    for (const pendingUserOperation of pendingUserOperations) {
      if (!hashedToasts.has(pendingUserOperation.hash)) {
        toast.info("Processing user operation...", {
          id: pendingUserOperation.hash,
          duration: Infinity,
          action: {
            label: "View",
            onClick: () => {
              window.open(
                `https://explorer.light.so/op/${pendingUserOperation.hash}`,
                "_blank",
              );
            },
          },
          position: "top-right",
        });

        setHashedToasts(
          prevHashes => new Set(prevHashes.add(pendingUserOperation.hash)),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUserOperations, isPendingUserOperationsLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!pendingUserOperations || isPendingUserOperationsLoading) {
    return null;
  }

  return pendingUserOperations?.map(pendingUserOperation => (
    <ProgressUserOperationOp
      key={pendingUserOperation.hash}
      hash={pendingUserOperation.hash as Hex}
      onExecuted={refetchPendingUserOperations}
    />
  ));
};
