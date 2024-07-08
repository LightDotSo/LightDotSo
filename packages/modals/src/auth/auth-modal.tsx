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

import { useSignInWithSiwe } from "@lightdotso/hooks";
import { useModals } from "@lightdotso/stores";
import { Modal } from "@lightdotso/templates";
import { Button, DialogDescription, DialogTitle } from "@lightdotso/ui";
import { useEffect } from "react";

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

  const { isSignInWithSiwePending, handleSignIn, isSignInWithSiweSuccess } =
    useSignInWithSiwe();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Close modal on success
  useEffect(() => {
    if (isSignInWithSiweSuccess) {
      hideAuthModal();
    }
  }, [isSignInWithSiweSuccess, hideAuthModal]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      open={isAuthModalVisible}
      size="sm"
      footerContent={
        <div className="flex justify-end">
          <Button
            disabled={isSignInWithSiwePending}
            isLoading={isSignInWithSiwePending}
            type="submit"
            size="sm"
            className="w-full md:w-auto"
            onClick={handleSignIn}
          >
            <span className="sr-only">Login</span>
            Login
          </Button>
        </div>
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

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default AuthModal;
