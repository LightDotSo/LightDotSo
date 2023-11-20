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

import { handler } from "@/handlers/paths/[address]";
import type { Address, Hex } from "viem";
import { getUserOperations, getQueryClient } from "@/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "@lightdotso/ui";
import { chains } from "@/const/chains";
import { SettingsDeploymentCard } from "@/app/(wallet)/[address]/settings/(components)/settings-deployment-card";

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
  // Handlers
  // ---------------------------------------------------------------------------

  const { wallet, config } = await handler(params);

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

  return res.match(
    res => {
      queryClient.setQueryData(
        [
          "user_operations",
          "executed",
          "asc",
          Number.MAX_SAFE_INTEGER,
          params.address,
        ],
        res,
      );

      return (
        <HydrationBoundary state={dehydrate(queryClient)}>
          {chains.map(chain => (
            <Suspense
              key={chain.id}
              fallback={<Skeleton className="h-8 w-32"></Skeleton>}
            >
              <SettingsDeploymentCard
                chain={chain}
                address={params.address}
                image_hash={config.image_hash as Hex}
                salt={wallet.salt as Hex}
              ></SettingsDeploymentCard>
            </Suspense>
          ))}
        </HydrationBoundary>
      );
    },
    _ => {
      return null;
    },
  );
}
