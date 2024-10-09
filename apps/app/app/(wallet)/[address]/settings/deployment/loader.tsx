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

import type { PageProps as OriginalPageProps } from "@/app/(wallet)/[address]/settings/billing/page";
import { SettingsCardSkeleton } from "@/components/settings/settings-card";
import { CHAINS, MAINNET_CHAINS } from "@lightdotso/const";
import dynamic from "next/dynamic";
import type { Address, Hex } from "viem";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const SettingsDeploymentCard = dynamic(
  () =>
    import(
      "@/app/(wallet)/[address]/settings/deployment/(components)/settings-deployment-card"
    ).then((mod) => ({
      default: mod.SettingsDeploymentCard,
    })),
  {
    loading: () => <SettingsCardSkeleton />,
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type PageProps = {
  // biome-ignore lint/style/useNamingConvention: <explanation>
  image_hash: Hex;
  salt: Hex;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  is_enabled_testnet: boolean;
  params: Awaited<OriginalPageProps["params"]>;
};

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function Loader({
  params,
  image_hash,
  salt,
  is_enabled_testnet,
}: PageProps) {
  // ---------------------------------------------------------------------------
  // Internal Variables
  // ---------------------------------------------------------------------------

  const walletChains = is_enabled_testnet ? CHAINS : MAINNET_CHAINS;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {walletChains.map((chain) => (
        <SettingsDeploymentCard
          key={chain.id}
          address={params.address as Address}
          chain={JSON.stringify(chain)}
          image_hash={image_hash}
          salt={salt}
        />
      ))}
    </>
  );
}
