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
  useQueryUserOperationMerkle,
} from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { StateInfoSection } from "@lightdotso/ui";
import { shortenBytes32 } from "@lightdotso/utils";
import { getEtherscanUrlWithChainId } from "@lightdotso/utils/src/etherscan";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { type FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionStatus: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pendingUserOperationMerkleRoot, pendingUserOperationHashes } =
    useUserOperations();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperationMerkle } = useQueryUserOperationMerkle({
    root: pendingUserOperationMerkleRoot,
  });

  const { userOperation } = useQueryUserOperation({
    hash:
      pendingUserOperationHashes && pendingUserOperationHashes.length === 1
        ? pendingUserOperationHashes[0]
        : null,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            ? "Pending transaction..."
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
            Merkle Root: {shortenBytes32(pendingUserOperationMerkleRoot)}
          </div>
        )}
        {pendingUserOperationHashes.length === 1 && (
          <div className="text-xs text-text-weak">
            Transaction Hash: {shortenBytes32(pendingUserOperationHashes[0])}
          </div>
        )}
        {userOperationMerkle &&
          userOperationMerkle.user_operations
            .filter(userOperation => userOperation.transaction !== null)
            .map(userOperation => (
              <div key={userOperation.hash} className="text-xs text-text-weak">
                Transaction Hash:{" "}
                {userOperation &&
                  userOperation.transaction &&
                  shortenBytes32(userOperation.transaction?.hash)}
              </div>
            ))}
        {userOperation && userOperation.transaction && (
          <div className="text-xs text-text-weak">
            Transaction Hash:{" "}
            {`${getEtherscanUrlWithChainId(userOperation.chain_id)}`}
          </div>
        )}
      </div>
    </StateInfoSection>
  );
};
