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

import { handler } from "@/handlers/paths/[address]/handler";
import { preloader } from "@/preloaders/paths/[address]/preloader";
import type { Address, Hex } from "viem";
import { getUserOperations, getQueryClient } from "@/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "@lightdotso/ui";
import { chains, mainnet_chains } from "@/const/chains";
import { SettingsDeploymentCard } from "@/app/(wallet)/[address]/settings/(components)/settings-deployment-card";
import { queries } from "@/queries";

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

  const { wallet, config, walletSettings } = await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  const res = await getUserOperations(
    params.address as Address,
    "executed",
    "asc",
    Number.MAX_SAFE_INTEGER,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const wallet_chains = walletSettings?.is_enabled_testnet
    ? chains
    : mainnet_chains;

  return res.match(
    res => {
      queryClient.setQueryData(
        queries.user_operation.list({
          address: params.address as Address,
          status: "executed",
          order: "asc",
          limit: Number.MAX_SAFE_INTEGER,
        }).queryKey,
        res,
      );

      return (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <div className="space-y-8 lg:space-y-12">
            {wallet_chains.map(chain => (
              <Suspense
                key={chain.id}
                fallback={<Skeleton className="h-8 w-32"></Skeleton>}
              >
                <SettingsDeploymentCard
                  chain={JSON.stringify(chain)}
                  address={params.address as Address}
                  image_hash={config.image_hash as Hex}
                  salt={wallet.salt as Hex}
                ></SettingsDeploymentCard>
              </Suspense>
            ))}
          </div>
        </HydrationBoundary>
      );
    },
    _ => {
      return null;
    },
  );
}
