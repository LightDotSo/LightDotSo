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

import { useUserOperationSend } from "@lightdotso/hooks";
import { useQueryUserOperations } from "@lightdotso/query";
import { useAuth } from "@lightdotso/stores";
import { useEffect, type FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface UserOperationStateOpProps {
  address: Address;
  hash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationStateOp: FC<UserOperationStateOpProps> = ({
  address,
  hash,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { handleSubmit } = useUserOperationSend({
    address: address as Address,
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Submit user operation every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await handleSubmit();
    }, 3_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationState: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    userOperations: pendingUserOperations,
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

  // Refetch pending user operation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPendingUserOperations();
    }, 30_000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!pendingUserOperations || !wallet) {
    return null;
  }

  return (
    <>
      {pendingUserOperations.map(pendingUserOperation => (
        <UserOperationStateOp
          key={pendingUserOperation.hash}
          address={wallet}
          hash={pendingUserOperation.hash as Hex}
        />
      ))}
    </>
  );
};
