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
import { useWeb3Modal, useWeb3ModalState } from "@lightdotso/wagmi";
import { useCallback, useMemo } from "react";
import { useSignInWithSiwe } from "./useSignInWithSiwe";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAuthModal = (useModal = true) => {
  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const { isPending, handleSignIn } = useSignInWithSiwe();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, sessionId } = useAuth();

  // ---------------------------------------------------------------------------
  // Web3Modal
  // ---------------------------------------------------------------------------

  const { open } = useWeb3Modal();
  const { open: isOpen } = useWeb3ModalState();
  const { showAuthModal } = useModals();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleAuthModal = useCallback(() => {
    if (!address && open) {
      open();
    } else if (typeof sessionId !== "string" || useModal) {
      showAuthModal();
    } else {
      handleSignIn();
    }
  }, [address, open, sessionId, showAuthModal]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isAuthValid = useMemo(() => {
    return typeof sessionId === "string" && !!address;
  }, [sessionId, address]);

  const isAuthLoading = useMemo(() => {
    return isPending || !isAuthValid || isOpen;
  }, [isPending, isAuthValid]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { isAuthValid, isAuthLoading, handleAuthModal };
};
