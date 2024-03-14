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
import { StateInfoSection } from "@lightdotso/ui";
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
    isUserOperationSendLoading,
    isUserOperationSendIdle,
    isUserOperationSendSuccess,
    handleSubmit,
  } = useUserOperationSend({
    address: address,
    hash: hash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Confirm the user operation on mount
  useEffect(() => {
    if (isUserOperationSendIdle && !isUserOperationSendSuccess) {
      handleSubmit();
    }
  }, [isUserOperationSendIdle, isUserOperationSendSuccess, handleSubmit]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {isUserOperationSendLoading && "Loading..."}
      {isUserOperationSendSuccess && "Suucess!"}
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
