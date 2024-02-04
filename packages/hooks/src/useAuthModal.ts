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

  return { isAuthValid, isAuthLoading, handleAuthModal };
};
