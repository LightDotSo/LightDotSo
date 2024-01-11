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

// From: https://wagmi.sh/react/guides/connect-wallet#third-party-libraries
// License: MIT

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@lightdotso/ui";
import { useEffect } from "react";
import { useConnect } from "wagmi";
import { WalletOptionButton } from "@/components/web3/wallet-option-button";
import { useAuth, useModals } from "@/stores";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function WalletModal() {
  // ---------------------------------------------------------------------------
  // Wagmi Hooks
  // ---------------------------------------------------------------------------

  const { connectors, connect } = useConnect();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  const { isWalletModalVisible, hideWalletModal } = useModals();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (address) {
      hideWalletModal();
    }
  }, [address, hideWalletModal]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isWalletModalVisible) {
    return (
      <Dialog open>
        <DialogPortal>
          <DialogOverlay onClick={hideWalletModal} />
          <DialogContent
            className="sm:max-w-md"
            onEscapeKeyDown={hideWalletModal}
          >
            <DialogHeader>
              <DialogTitle>Connect</DialogTitle>
              <DialogDescription>
                Connect your wallet to continue
              </DialogDescription>
            </DialogHeader>
            {connectors.map(connector => (
              <WalletOptionButton
                key={connector.uid}
                connector={connector}
                onClick={() => connect({ connector })}
              />
            ))}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default WalletModal;
