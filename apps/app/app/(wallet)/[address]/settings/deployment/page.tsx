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

import { CHAINS, MAINNET_CHAINS } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { SettingsSectionWrapper } from "@lightdotso/ui";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import type { Address, Hex } from "viem";
import { SettingsDeploymentCard } from "@/app/(wallet)/[address]/settings/deployment/(components)/settings-deployment-card";
import { handler } from "@/handlers/paths/[address]/settings/deployment/handler";
import { preloader } from "@/preloaders/paths/[address]/preloader";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { wallet, config, walletSettings, userOperations } =
    await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: params.address as Address,
      status: "history",
      order: "asc",
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperations,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const wallet_chains = walletSettings?.is_enabled_testnet
    ? CHAINS
    : MAINNET_CHAINS;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsSectionWrapper>
        {wallet_chains.map(chain => (
          <Suspense key={chain.id}>
            <SettingsDeploymentCard
              chain={JSON.stringify(chain)}
              address={params.address as Address}
              image_hash={config.image_hash as Hex}
              salt={wallet.salt as Hex}
            />
          </Suspense>
        ))}
      </SettingsSectionWrapper>
    </HydrationBoundary>
  );
}
