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

import { EmptyState, NftImage } from "@lightdotso/elements";
import { useQueryNfts } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { Modal } from "@lightdotso/templates";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NftModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    isNftModalVisible,
    nftModalProps: { address, isTestnet, onClose, onNftSelect },
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
      <Modal open className="p-2" onClose={onClose}>
        {nftPage && nftPage.nfts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {nftPage.nfts
              .filter(
                nft =>
                  nft?.collection?.spam_score !== undefined &&
                  nft?.collection?.spam_score !== null &&
                  nft?.collection?.spam_score < 60,
              )
              .map(nft => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  key={nft.nft_id}
                  className="col-span-1 cursor-pointer flex-row items-center rounded-md hover:ring-2 ring-border-primary"
                  onClick={() => onNftSelect(nft)}
                >
                  <NftImage nft={nft} className="rounded-t-md" />
                </div>
              ))}
          </div>
        ) : (
          <div className="flex w-full justify-center h-32 text-center">
            <EmptyState entity="nft" />
          </div>
        )}
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default NftModal;
