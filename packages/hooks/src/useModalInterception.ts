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

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useModalInterception() {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isBackCalled, setIsBackCalled] = useState(false);

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const modalDismiss = useCallback(() => {
    if (!isBackCalled) {
      router.back();
      setIsBackCalled(true);
    }
  }, [router, isBackCalled]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsBackCalled(false);
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return modalDismiss;
}
