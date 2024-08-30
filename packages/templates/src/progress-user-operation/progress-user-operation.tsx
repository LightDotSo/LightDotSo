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
  useQueryUserOperation,
  useQueryUserOperations,
} from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui/components/toast";
import { type FC, useEffect, useState } from "react";
import type { Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PendingUserOperationOpProps = {
  hash: Hex;
};

// -----------------------------------------------------------------------------
// Internal Component
// -----------------------------------------------------------------------------

export const ProgressUserOperationOp: FC<PendingUserOperationOpProps> = ({
  hash,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperation } = useQueryUserOperation({
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Display a `toast.success` when the user operation is executed
  useEffect(() => {
    if (userOperation && userOperation.status === "EXECUTED") {
      toast.dismiss(hash);

      toast.success("Transaction executed!", {
        position: "top-right",
      });
    }
  }, [hash, userOperation]);

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!pendingUserOperations || isPendingUserOperationsLoading) {
      return;
    }

    if (
      pendingUserOperations &&
      typeof pendingUserOperations !== "undefined" &&
      pendingUserOperations?.length > 0 &&
      !isPendingUserOperationsLoading
    ) {
      for (const pendingUserOperation of pendingUserOperations) {
        if (!hashedToasts.has(pendingUserOperation.hash)) {
          toast.info("Processing user operation...", {
            id: pendingUserOperation.hash,
            duration: Number.POSITIVE_INFINITY,
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
            (prevHashes) => new Set(prevHashes.add(pendingUserOperation.hash)),
          );
        }
      }
    }
  }, [pendingUserOperations, isPendingUserOperationsLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (
    !(pendingUserOperations && Array.isArray(pendingUserOperations)) ||
    isPendingUserOperationsLoading
  ) {
    return null;
  }

  return (
    pendingUserOperations &&
    pendingUserOperations?.length > 0 &&
    pendingUserOperations?.map((pendingUserOperation) => (
      <ProgressUserOperationOp
        key={pendingUserOperation.hash}
        hash={pendingUserOperation.hash as Hex}
      />
    ))
  );
};
