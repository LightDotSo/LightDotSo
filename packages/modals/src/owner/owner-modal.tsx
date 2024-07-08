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

import { OwnerForm } from "@lightdotso/forms";
import { useFormRef, useModals } from "@lightdotso/stores";
import { FooterButton, Modal } from "@lightdotso/templates";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function OwnerModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    isOwnerModalVisible,
    hideOwnerModal,
    // ownerModalProps: { onOwnerSelect },
  } = useModals();
  const { isFormDisabled, isFormLoading } = useFormRef();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      isHeightFixed
      open={isOwnerModalVisible}
      size="lg"
      className="h-[36rem] p-2"
      footerContent={
        <FooterButton
          className="pt-0"
          disabled={isFormDisabled || isFormLoading}
          form="owner-form"
          customSuccessText="Upgrade"
          cancelClick={hideOwnerModal}
        />
      }
      onClose={hideOwnerModal}
    >
      <div className="p-4">
        <OwnerForm />
      </div>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default OwnerModal;
