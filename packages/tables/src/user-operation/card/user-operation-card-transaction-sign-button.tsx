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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { useUserOperationSign } from "@lightdotso/hooks";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardTransactionSignButtonProps = {
  address: Address;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardTransactionSignButton: FC<
  UserOperationCardTransactionSignButtonProps
> = ({ address, configuration, userOperation }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    isUserOperationSignPending,
    isUserOperationSigned,
    isUserOperationSignable,
    signUserOperation,
  } = useUserOperationSign({
    address: address as Address,
    configuration: configuration,
    userOperation: userOperation,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={!isUserOperationSignable}
            isLoading={isUserOperationSignPending}
            variant={isUserOperationSignable ? "default" : "outline"}
            className="w-full"
            onClick={signUserOperation}
          >
            Sign
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isUserOperationSignable
            ? "Sign this transaction"
            : isUserOperationSigned
              ? "You have already signed this transaction"
              : "This transaction is not signable"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
