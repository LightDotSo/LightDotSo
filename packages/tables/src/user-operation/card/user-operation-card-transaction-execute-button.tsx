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

import type { UserOperationData } from "@lightdotso/data";
import { useUserOperationSend } from "@lightdotso/hooks";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import type { FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardTransactionExecuteButtonProps = {
  address: Address;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardTransactionExecuteButton: FC<
  UserOperationCardTransactionExecuteButtonProps
> = ({ address, userOperation }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    isUserOperationSendValid,
    isUserOperationSendLoading,
    isUserOperationSendIdle,
    isUserOperationSendSuccess,
    handleSubmit,
  } = useUserOperationSend({
    address: address as Address,
    hash: userOperation.hash as Hex,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={
              !isUserOperationSendValid ||
              isUserOperationSendLoading ||
              (!isUserOperationSendIdle && isUserOperationSendSuccess) ||
              userOperation.status !== "PROPOSED"
            }
            isLoading={isUserOperationSendLoading}
            variant={isUserOperationSendValid ? "default" : "outline"}
            className="w-full"
            onClick={handleSubmit}
          >
            {userOperation.status === "PROPOSED"
              ? "Execute"
              : userOperation.status === "PENDING"
                ? "Pending"
                : "Already executed"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {userOperation.status === "EXECUTED" ? (
            <span>
              Already executed on{" "}
              {new Date(userOperation.updated_at).toLocaleDateString()}
            </span>
          ) : userOperation.status === "PENDING" ? (
            <span>Transaction is pending...</span>
          ) : (
            <span>Execute this transaction</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
