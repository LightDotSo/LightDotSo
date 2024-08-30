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

"use client";

import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsCardBaseButton } from "@/components/settings/settings-card-base-button";
import { TITLES } from "@/const";
import { useQueryWalletNotificationSettings } from "@lightdotso/query";
import { Button } from "@lightdotso/ui/components/button";
import type { FC } from "react";
import type { Address } from "viem";

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
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsNotificationsCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="settings-notifications-settings-card-form"
        disabled={true}
      >
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
        TITLES.WalletSettings.subcategories.Notifications.subcategories[
          "Notification Settings"
        ].title
      }
      subtitle={
        TITLES.WalletSettings.subcategories.Notifications.subcategories[
          "Notification Settings"
        ].description
      }
      footerContent={
        <SettingsCardBaseButton>
          <SettingsNotificationsCardSubmitButton />
        </SettingsCardBaseButton>
      }
    >
      <div className="flex text-lg">
        <span>{walletNotificationSettings?.id}</span>
      </div>
    </SettingsCard>
  );
};
