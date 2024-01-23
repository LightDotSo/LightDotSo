// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use client";

import { useAuth, useModals } from "@lightdotso/stores";
import { Modal } from "@lightdotso/templates";
import { DialogDescription, DialogTitle } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NftModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  const { hideNftModal } = useModals();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!address) {
    return null;
  }

  return (
    <Modal open size="sm" onClose={hideNftModal}>
      <DialogTitle>Login</DialogTitle>
      <DialogDescription>
        Login with your wallet to access your account.
      </DialogDescription>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default NftModal;
