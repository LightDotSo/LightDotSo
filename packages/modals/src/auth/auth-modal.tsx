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

import { useModals } from "@lightdotso/stores";
import { useSignInWithSiwe } from "@lightdotso/hooks";
import { Modal } from "@lightdotso/templates";
import { Button, DialogDescription, DialogTitle } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AuthModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isAuthModalVisible, hideAuthModal } = useModals();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const { isPending, handleSignIn } = useSignInWithSiwe();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isAuthModalVisible) {
    return (
      <Modal
        open
        size="sm"
        footerContent={
          <Button
            disabled={isPending}
            isLoading={isPending}
            type="submit"
            size="sm"
            className="px-3"
            onClick={handleSignIn}
          >
            <span className="sr-only">Login</span>
            Login
          </Button>
        }
        onClose={hideAuthModal}
      >
        <DialogTitle>Login</DialogTitle>
        <DialogDescription>
          Login with your wallet to access your account.
        </DialogDescription>
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default AuthModal;
