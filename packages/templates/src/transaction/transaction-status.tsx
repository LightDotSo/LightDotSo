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

import { useQueryUserOperation } from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { StateInfoSection } from "@lightdotso/ui";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { memo, type FC } from "react";
import type { Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionStatusOpProps {
  hash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionStatusOp: FC<TransactionStatusOpProps> = memo(
  ({ hash }) => {
    // ---------------------------------------------------------------------------
    // Hooks
    // ---------------------------------------------------------------------------

    const { userOperation } = useQueryUserOperation({
      hash: hash,
    });

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return <div>{userOperation?.status}</div>;
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionStatus: FC = () => {
  // -------------------------------------------------------------------------
  // Stores
  // -------------------------------------------------------------------------

  const { pendingSubmitUserOperationHashes } = useUserOperations();

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        pendingSubmitUserOperationHashes.length > 0 ? (
          <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
        ) : (
          <CheckCircle2 className="mx-auto size-8 rounded-full border border-border p-2 text-text-weak md:size-10" />
        )
      }
      title={
        pendingSubmitUserOperationHashes.length > 0
          ? pendingSubmitUserOperationHashes.length === 1
            ? "Pending 1 transaction..."
            : `Pending ${pendingSubmitUserOperationHashes.length} transactions...`
          : "Success"
      }
      description={
        pendingSubmitUserOperationHashes.length > 0
          ? "Please wait while we handle your request..."
          : "Your transaction has been sent successfully."
      }
    >
      {pendingSubmitUserOperationHashes.map(hash => (
        <TransactionStatusOp key={hash} hash={hash} />
      ))}
    </StateInfoSection>
  );
};
