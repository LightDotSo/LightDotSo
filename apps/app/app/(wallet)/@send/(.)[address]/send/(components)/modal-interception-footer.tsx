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

import { useCallDataQueryState } from "@lightdotso/nuqs";
import { useAuth, useFormRef } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import { useMemo, type FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC = () => {
  // ---------------------------------------------------------------------------
  // Nuqs
  // ---------------------------------------------------------------------------

  const [callData] = useCallDataQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { isFormDisabled } = useFormRef();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const href = useMemo(() => {
    return `/${wallet}/send/${callData}`;
  }, [wallet, callData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      disabled={isFormDisabled}
      href={href}
    />
  );
};
