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

import { useModals } from "@lightdotso/stores";
import { ConnectButton } from "@lightdotso/templates/connect-button";
import { Modal } from "@lightdotso/templates/modal";
import {
  DialogDescription,
  DialogTitle,
} from "@lightdotso/ui/components/dialog";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ConnectModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isConnectModalVisible, hideConnectModal } = useModals();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal open={isConnectModalVisible} size="sm" onClose={hideConnectModal}>
      <DialogTitle>Connect</DialogTitle>
      <DialogDescription>
        <ConnectButton />
      </DialogDescription>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default ConnectModal;
