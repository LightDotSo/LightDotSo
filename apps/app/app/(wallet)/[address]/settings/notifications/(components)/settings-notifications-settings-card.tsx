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

import { useQueryWalletNotificationSettings } from "@lightdotso/query";
import { Button } from "@lightdotso/ui";
import type { FC } from "react";
import type { Address } from "viem";
import { SettingsCard } from "@/components/settings/settings-card";
import { TITLES } from "@/const";
import { useAuthModal } from "@lightdotso/hooks";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsNotificationSettingsCardProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsNotificationsSettingsCard: FC<
  SettingsNotificationSettingsCardProps
> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isAuthValid, isAuthLoading, handleAuthModal } = useAuthModal();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletNotificationSettings } = useQueryWalletNotificationSettings({
    address,
  });

  // ---------------------------------------------------------------------------
  // Submit Button
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

  const SettingsNotificationsCardSubmitButton: FC = () => {
    return (
      <Button type="submit" form="walletNotificationsForm" disabled={true}>
        Notifications
      </Button>
    );
  };

  const SettingsNotificationsCardButton: FC = () => {
    if (!isAuthValid) {
      return <WalletLoginButton />;
    }

    return <SettingsNotificationsCardSubmitButton />;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      title={
        TITLES.WalletSettings.subcategories["Notifications"].subcategories[
          "Notification Settings"
        ].title
      }
      subtitle={
        TITLES.WalletSettings.subcategories["Notifications"].subcategories[
          "Notification Settings"
        ].description
      }
      footerContent={<SettingsNotificationsCardButton />}
    >
      <div className="flex text-lg">
        <span>
          {walletNotificationSettings && walletNotificationSettings.id}
        </span>
      </div>
    </SettingsCard>
  );
};
