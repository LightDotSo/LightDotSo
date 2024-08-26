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

import { INTERNAL_LINKS } from "@lightdotso/const";
import { ExternalLink } from "@lightdotso/elements";
import {
  useQueryUserOperation,
  useQueryUserOperationMerkle,
} from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { StateInfoSection } from "@lightdotso/ui";
import { getEtherscanUrlWithChainId, shortenBytes32 } from "@lightdotso/utils";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { type FC, useMemo } from "react";

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

  const { userOperationMerkle } = useQueryUserOperationMerkle(
    {
      root: pendingUserOperationMerkleRoot,
    },
    true,
  );

  const { userOperation } = useQueryUserOperation(
    {
      hash:
        pendingUserOperationHashes && pendingUserOperationHashes.length === 1
          ? pendingUserOperationHashes[0]
          : null,
    },
    true,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isStatusPending = useMemo(() => {
    // Get the status from the user operation merkle
    if (userOperationMerkle) {
      return !userOperationMerkle.user_operations.every(
        (userOperation) => userOperation.transaction !== null,
      );
    }

    // Get the status from the single user operation
    if (userOperation) {
      return userOperation.transaction === null;
    }

    // Default to true if no data is available
    return true;
  }, [userOperationMerkle, userOperation]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        isStatusPending ? (
          <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
        ) : (
          <CheckCircle2 className="mx-auto size-8 rounded-full border border-border p-2 text-text-weak md:size-10" />
        )
      }
      title={
        isStatusPending
          ? pendingUserOperationHashes.length === 1
            ? "Pending transaction..."
            : `Pending ${pendingUserOperationHashes.length} transactions...`
          : "Success"
      }
      description={
        isStatusPending
          ? "Please wait while we handle your request..."
          : "Your transaction has been sent successfully."
      }
    >
      <div className="space-y-3">
        {userOperation && (
          <div className="text-text-weak text-xs">
            User Operation Hash:{" "}
            <ExternalLink
              className="inline-flex items-center hover:underline"
              href={`${INTERNAL_LINKS.Explorer}/op/${userOperation.hash}`}
            >
              {shortenBytes32(userOperation.hash)}
            </ExternalLink>
          </div>
        )}
        {pendingUserOperationMerkleRoot && (
          <div className="text-text-weak text-xs">
            Merkle Root:{" "}
            <ExternalLink
              className="inline-flex items-center hover:underline"
              href={`${INTERNAL_LINKS.Explorer}/ops/${pendingUserOperationMerkleRoot}`}
            >
              {shortenBytes32(pendingUserOperationMerkleRoot)}
            </ExternalLink>
          </div>
        )}
        {userOperationMerkle?.user_operations
          .filter((userOperation) => userOperation.transaction !== null)
          .map((userOperation) => (
            <div key={userOperation.hash} className="text-text-weak text-xs">
              Transaction Hash:{" "}
              <ExternalLink
                className="inline-flex items-center hover:underline"
                href={`${getEtherscanUrlWithChainId(userOperation.chain_id)}/tx/${userOperation.transaction?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenBytes32(userOperationMerkle.root)}
              </ExternalLink>
            </div>
          ))}
        {userOperation?.transaction && (
          <div className="text-text-weak text-xs">
            Transaction Hash:{" "}
            <ExternalLink
              className="inline-flex items-center hover:underline"
              href={`${getEtherscanUrlWithChainId(userOperation.chain_id)}/tx/${userOperation.transaction.hash}`}
            >
              {shortenBytes32(userOperation.transaction.hash)}
            </ExternalLink>
          </div>
        )}
      </div>
    </StateInfoSection>
  );
};
