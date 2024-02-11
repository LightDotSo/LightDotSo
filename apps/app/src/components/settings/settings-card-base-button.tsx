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

import { useAuthModal } from "@lightdotso/hooks";
import { Button } from "@lightdotso/ui";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsCardBaseButtonProps = {
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsCardBaseButton: FC<SettingsCardBaseButtonProps> = ({
  children,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isAuthValid, isAuthLoading, handleAuthModal } = useAuthModal();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const WalletLoginButton: FC = () => {
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <Button
        disabled={isAuthValid}
        isLoading={isAuthLoading}
        onClick={handleAuthModal}
      >
        Login to update name
      </Button>
    );
  };

  if (!isAuthValid) {
    return <WalletLoginButton />;
  }

  return children;
};
