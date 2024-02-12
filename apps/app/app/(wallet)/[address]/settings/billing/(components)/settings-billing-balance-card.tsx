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

import { useQueryWalletBilling } from "@lightdotso/query";
import { Button } from "@lightdotso/ui";
import type { FC } from "react";
import type { Address } from "viem";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsCardBaseButton } from "@/components/settings/settings-card-base-button";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsBillingBalanceCardProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsBillingBalanceCard: FC<
  SettingsBillingBalanceCardProps
> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletBilling } = useQueryWalletBilling({
    address,
  });

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsBillingCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="settings-billing-balance-card-button"
        disabled={true}
      >
        Billing
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      title={
        TITLES.WalletSettings.subcategories["Billing"].subcategories["Balance"]
          .title
      }
      subtitle={
        TITLES.WalletSettings.subcategories["Billing"].subcategories["Balance"]
          .description
      }
      footerContent={
        <SettingsCardBaseButton>
          <SettingsBillingCardSubmitButton />
        </SettingsCardBaseButton>
      }
    >
      <div className="flex text-lg">
        <span>${walletBilling && walletBilling.billing?.balance_usd}</span>
      </div>
    </SettingsCard>
  );
};
