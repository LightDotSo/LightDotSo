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
import { useQueryWalletBilling } from "@lightdotso/query";
import { Button } from "@lightdotso/ui/components/button";
import type { FC } from "react";
import type { Address } from "viem";

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
    address: address as Address,
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
        TITLES.WalletSettings.subcategories.Billing.subcategories.Balance.title
      }
      subtitle={
        TITLES.WalletSettings.subcategories.Billing.subcategories.Balance
          .description
      }
      footerContent={
        <SettingsCardBaseButton>
          <SettingsBillingCardSubmitButton />
        </SettingsCardBaseButton>
      }
    >
      <div className="flex text-lg">
        <span>${walletBilling?.billing?.balance_usd}</span>
      </div>
    </SettingsCard>
  );
};
