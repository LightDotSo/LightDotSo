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
  // Query
  // ---------------------------------------------------------------------------

  const { walletNotificationSettings } = useQueryWalletNotificationSettings({
    address,
  });

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsNotificationsCardSubmitButton: FC = () => {
    return (
      <Button type="submit" form="walletNotificationsForm" disabled={true}>
        Notifications
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      title={
        TITLES.Settings.subcategories["Notifications"].subcategories["Balance"]
          .title
      }
      subtitle={
        TITLES.Settings.subcategories["Notifications"].subcategories["Balance"]
          .description
      }
      footerContent={<SettingsNotificationsCardSubmitButton />}
    >
      <div className="flex text-lg">
        <span>
          $
          {walletNotificationSettings &&
            walletNotificationSettings.settings.length}
        </span>
      </div>
    </SettingsCard>
  );
};
