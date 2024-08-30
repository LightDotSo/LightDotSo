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
import { FooterButton } from "@lightdotso/templates";
import { useRouter } from "next/navigation";
import { type FC, useCallback } from "react";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalInterceptionFooterProps {
  address: Address;
  userOperationHash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC<ModalInterceptionFooterProps> = ({
  address,
  userOperationHash,
}) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    handleSubmit,
    isUserOperationSendDisabled,
    isUserOperationSendLoading,
  } = useUserOperationSend({
    address: address as Address,
    hash: userOperationHash,
  });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      disabled={isUserOperationSendLoading || isUserOperationSendDisabled}
      isLoading={isUserOperationSendLoading}
      customSuccessText="Refresh"
      cancelClick={onDismiss}
      onClick={handleSubmit}
    />
  );
};
