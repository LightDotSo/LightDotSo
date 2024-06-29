// Copyright 2023-2024 Light
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

import { useAuth, useModals } from "@lightdotso/stores";
import { useModal } from "@lightdotso/wagmi";
import { useCallback, useMemo } from "react";
import { useSignInWithSiwe } from "./useSignInWithSiwe";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAuthModal = (isOpenModal = true) => {
  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const { isPending, handleSignIn } = useSignInWithSiwe();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, sessionId } = useAuth();
  const { showAuthModal } = useModals();

  // ---------------------------------------------------------------------------
  // Connectkit
  // ---------------------------------------------------------------------------

  const { open, setOpen } = useModal();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleAuthModal = useCallback(() => {
    if (!address && open) {
      setOpen(true);
    } else if (typeof sessionId !== "string" || isOpenModal) {
      showAuthModal();
    } else {
      handleSignIn();
    }
  }, [
    address,
    open,
    sessionId,
    showAuthModal,
    handleSignIn,
    setOpen,
    isOpenModal,
  ]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isAuthValid = useMemo(() => {
    return typeof sessionId === "string" && !!address;
  }, [sessionId, address]);

  const isAuthLoading = useMemo(() => {
    return isPending || open;
  }, [isPending, open]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isAuthValid: isAuthValid,
    isAuthLoading: isAuthLoading,
    handleAuthModal: handleAuthModal,
  };
};
