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

import type { ConfigurationData } from "@lightdotso/data";
import { useUserOperationSend } from "@lightdotso/hooks";
import { useQueryConfiguration } from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { Button, StateInfoSection } from "@lightdotso/ui";
import { getChainById, getEtherscanUrl } from "@lightdotso/utils";
import { LoaderIcon } from "lucide-react";
import { useEffect, type FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TransactionSenderOpProps {
  address: Address;
  configuration: ConfigurationData;
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

  const {
    userOperation,
    refetchUserOperation,
    isUserOperationSendPending,
    isUserOperationSendLoading,
    isUserOperationSendSuccess,
    handleSubmit,
  } = useUserOperationSend({
    address: address,
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Refetch the user operation on mount
  useEffect(() => {
    refetchUserOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch the user operation and handle every 30 seconds if the operation is still pending
  useEffect(() => {
    const checkUserOperation = async () => {
      if (isUserOperationSendPending) {
        await handleSubmit();
      }
    };

    // Run the function immediately on mount.
    checkUserOperation();

    // Run the function every 30 seconds.
    const interval = setInterval(checkUserOperation, 30000);

    // Clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []); // Empty dependency array makes this run on mount and unmount only.

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {isUserOperationSendLoading && "Loading..."}
      {isUserOperationSendSuccess && "Success!"}
      {isUserOperationSendSuccess && userOperation?.chain_id && (
        <Button asChild>
          <a
            href={`${getEtherscanUrl(
              getChainById(userOperation?.chain_id),
            )}/tx/${userOperation.hash}`}
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

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pendingSubmitUserOperationHashes } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        <LoaderIcon className="mx-auto size-8 animate-spin rounded-full border border-border p-2 text-text-weak duration-1000 md:size-10" />
      }
      title="Sending Transaction..."
      description="Please wait while we handle your request..."
    >
      {configuration &&
        pendingSubmitUserOperationHashes.map((hash, index) => (
          <TransactionSenderOp
            key={index}
            address={address}
            configuration={configuration}
            hash={hash}
          />
        ))}
    </StateInfoSection>
  );
};
