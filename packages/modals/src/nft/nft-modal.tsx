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

import { EmptyState, NftImage } from "@lightdotso/elements";
import { useMediaQuery } from "@lightdotso/hooks";
import { useQueryNfts } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { Modal } from "@lightdotso/templates";
import type { Address } from "viem";

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
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { nftPage } = useQueryNfts({
    address: address as Address,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: isTestnet ?? false,
    cursor: null,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isNftModalVisible) {
    return (
      <Modal isHeightFixed open className="p-2" onClose={onClose}>
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
                  className="col-span-1 cursor-pointer flex-row items-center rounded-md ring-border-primary hover:ring-2"
                  onClick={() => onNftSelect(nft)}
                >
                  <NftImage nft={nft} className="rounded-t-md" />
                </div>
              ))}
          </div>
        ) : (
          <div className="flex size-full items-center justify-center text-center">
            <EmptyState entity="nft" size={isDesktop ? "xl" : "default"} />
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
