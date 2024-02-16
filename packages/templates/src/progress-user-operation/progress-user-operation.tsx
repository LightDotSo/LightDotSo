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

import { useQueryUserOperations } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { type FC, useEffect, useState } from "react";

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

  const { userOperations, isUserOperationsLoading } = useQueryUserOperations({
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

  // Issue a `toast.loading` for each pending user operation
  useEffect(() => {
    if (!userOperations || isUserOperationsLoading) {
      return;
    }

    for (const userOperation of userOperations) {
      if (!hashedToasts.has(userOperation.hash)) {
        toast.info("Processing user operation...", {
          action: {
            label: "View Progress",
            onClick: () => {
              window.open(
                `https://explorer.light.so/op/${userOperation.hash}`,
                "_blank",
              );
            },
          },
          position: "top-right",
        });

        setHashedToasts(
          prevHashes => new Set(prevHashes.add(userOperation.hash)),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperations, isUserOperationsLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
