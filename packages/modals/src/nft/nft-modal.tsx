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

import { useQueryNfts } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { Modal } from "@lightdotso/templates";
import { DialogDescription, DialogTitle } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NftModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    isNftModalVisible,
    hideNftModal,
    nftModalProps: { address, isTestnet },
  } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { nftPage } = useQueryNfts({
    address: address,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: isTestnet ?? false,
    cursor: null,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isNftModalVisible) {
    return (
      <Modal open size="sm" onClose={hideNftModal}>
        <DialogTitle>NFT</DialogTitle>
        <DialogDescription>NFT for</DialogDescription>
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default NftModal;
