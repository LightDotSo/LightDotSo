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

import { useUserOperations } from "@lightdotso/stores";
import { StateInfoSection } from "@lightdotso/ui";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { type FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionStatus: FC = () => {
  // -------------------------------------------------------------------------
  // Stores
  // -------------------------------------------------------------------------

  const { pendingUserOperationMerkleRoot, pendingUserOperationHashes } =
    useUserOperations();

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        pendingUserOperationHashes.length > 0 ? (
          <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
        ) : (
          <CheckCircle2 className="mx-auto size-8 rounded-full border border-border p-2 text-text-weak md:size-10" />
        )
      }
      title={
        pendingUserOperationHashes.length > 0
          ? pendingUserOperationHashes.length === 1
            ? "Pending 1 transaction..."
            : `Pending ${pendingUserOperationHashes.length} transactions...`
          : "Success"
      }
      description={
        pendingUserOperationHashes.length > 0
          ? "Please wait while we handle your request..."
          : "Your transaction has been sent successfully."
      }
    >
      <div className="space-y-3">
        {pendingUserOperationMerkleRoot && (
          <div className="text-xs text-text-weak">
            Merkle Root: {pendingUserOperationMerkleRoot}
          </div>
        )}
      </div>
    </StateInfoSection>
  );
};
