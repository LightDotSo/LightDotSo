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
import { useQueryUserOperation } from "@lightdotso/query";
import { useUserOperations } from "@lightdotso/stores";
import { Button, StateInfoSection } from "@lightdotso/ui";
import { getChainById, getEtherscanUrl } from "@lightdotso/utils";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { useEffect, type FC } from "react";
import type { Address, Hex } from "viem";

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
  // Stores
  // ---------------------------------------------------------------------------

  const { pendingSubmitUserOperationHashes } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
    />
  );
};
