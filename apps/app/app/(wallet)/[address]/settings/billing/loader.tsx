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

import type { PageProps } from "@/app/(wallet)/[address]/settings/billing/page";
import { SettingsCardSkeleton } from "@/components/settings/settings-card";
import dynamic from "next/dynamic";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const SettingsBillingBalanceCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/billing/(components)/settings-billing-balance-card"
    ).then((mod) => mod.SettingsBillingBalanceCard),
  {
    loading: () => <SettingsCardSkeleton />,
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function Loader({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <SettingsBillingBalanceCard address={params.address as Address} />;
}
