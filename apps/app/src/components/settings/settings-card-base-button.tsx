// Copyright 2023-2024 LightDotSo.
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

import { useAuthModal } from "@lightdotso/hooks";
import { Button } from "@lightdotso/ui/components/button";
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
