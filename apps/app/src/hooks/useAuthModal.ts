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

import { useModal } from "connectkit";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/stores/useAuth";
import { useModals } from "@/stores/useModals";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAuthModal = () => {
  const { isSessionValid, address } = useAuth();
  const { openProfile } = useModal();

  const { showAuthModal } = useModals();

  const openAuthModal = useCallback(() => {
    if (!address) {
      openProfile();
    } else if (!isSessionValid()) {
      showAuthModal();
    }
  }, [address, isSessionValid, openProfile, showAuthModal]);

  const isAuthValid = useMemo(() => {
    return isSessionValid() && !!address;
  }, [isSessionValid, address]);

  return { isAuthValid, openAuthModal };
};
