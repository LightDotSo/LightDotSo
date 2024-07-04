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

import { InvokeButton } from "@lightdotso/elements";
import { useUserOperationSend, useUserOperationsSend } from "@lightdotso/hooks";
import type { FC } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OpInvokeButtonProps {
  address: Address;
  userOperationHash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpInvokeButton: FC<OpInvokeButtonProps> = ({
  address,
  userOperationHash,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isUserOperationsSendLoading } = useUserOperationsSend();
  const { handleSubmit } = useUserOperationSend({
    address: address as Address,
    hash: userOperationHash,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <InvokeButton
      isLoading={isUserOperationsSendLoading}
      onClick={handleSubmit}
    />
  );
};
