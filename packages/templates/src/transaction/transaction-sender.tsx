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

import { useIsMounted, useUserOperationSend } from "@lightdotso/hooks";
import { useQueryUserOperations } from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { Button, StateInfoSection } from "@lightdotso/ui";
import { getChainById, getEtherscanUrl } from "@lightdotso/utils";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { useEffect, useMemo, type FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionSenderOpProps {
  address: Address;
  hash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionSenderOp: FC<TransactionSenderOpProps> = ({
  address,
  hash,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { userOperation, handleSubmit } = useUserOperationSend({
    address: address as Address,
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Submit user operation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSubmit();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {userOperation?.transaction?.hash && (
        <Button asChild variant="link">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${getEtherscanUrl(
              getChainById(userOperation?.chain_id),
            )}/tx/${userOperation?.transaction?.hash}`}
          >
            {userOperation?.transaction?.hash}
          </a>
        </Button>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionSenderProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionSender: FC<TransactionSenderProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    userOperations: pendingUserOperations,
    isUserOperationsLoading: isPendingUserOperationsLoading,
  } = useQueryUserOperations({
    address: address,
    status: "pending",
    order: "desc",
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    is_testnet: true,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const initialPendingUserOperations = useMemo(() => {
    if (pendingUserOperations) {
      return pendingUserOperations;
    }
  }, [isPendingUserOperationsLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isPendingUserOperationsLoading) {
    return (
      <StateInfoSection
        icon={
          <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
        }
        title="Loading..."
        description="Please wait while we fetch your pending transactions."
      >
        <></>
      </StateInfoSection>
    );
  }

  return (
    <StateInfoSection
      icon={
        pendingUserOperations && pendingUserOperations.length > 0 ? (
          <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
        ) : (
          <CheckCircle2 className="mx-auto size-8 rounded-full border border-border p-2 text-text-weak md:size-10" />
        )
      }
      title={
        pendingUserOperations && pendingUserOperations.length > 0
          ? "Sending Transaction..."
          : "Success"
      }
      description={
        pendingUserOperations && pendingUserOperations.length > 0
          ? "Please wait while we handle your request..."
          : "Your transaction has been sent successfully."
      }
    >
      {pendingUserOperations &&
        pendingUserOperations.map((pendingUserOperation, index) => (
          <TransactionSenderOp
            key={index}
            address={address}
            hash={pendingUserOperation.hash as Hex}
          />
        ))}
    </StateInfoSection>
  );
};
