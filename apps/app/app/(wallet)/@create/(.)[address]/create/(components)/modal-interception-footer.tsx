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

import { useUserOperationCreate } from "@lightdotso/hooks";
import { useFormRef, useModals, useUserOperations } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import { useRouter } from "next/navigation";
import { type FC, useCallback } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ModalInterceptionFooterProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC<ModalInterceptionFooterProps> = ({
  address,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { hideCreateModal, setSendBackgroundModal } = useModals();
  const { resetAll } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    setSendBackgroundModal(false);
    hideCreateModal();
    resetAll();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { signUserOperation } = useUserOperationCreate({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isFormDisabled, isFormLoading, customFormSuccessText } = useFormRef();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      customSuccessText={customFormSuccessText}
      disabled={isFormLoading || isFormDisabled}
      isLoading={isFormLoading}
      cancelClick={onDismiss}
      onClick={signUserOperation}
    />
  );
};
