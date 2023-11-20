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
import type { Address } from "viem";
import { getWalletSettings, getQueryClient } from "@/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "@lightdotso/ui";
import { SettingsNameCard } from "@/app/(wallet)/[address]/settings/(components)/settings-name-card";
import { SettingsTestnetCard } from "@/app/(wallet)/[address]/settings/(components)/settings-testnet-card";
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

  await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  const res = await getWalletSettings(params.address as Address);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  queryClient.setQueryData(
    queries.wallet.settings(params.address as Address).queryKey,
    res.unwrapOr(null),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8 lg:space-y-12">
        <Suspense fallback={<Skeleton className="h-8 w-32"></Skeleton>}>
          <SettingsNameCard
            address={params.address as Address}
          ></SettingsNameCard>
        </Suspense>
        <Suspense fallback={<Skeleton className="h-8 w-32"></Skeleton>}>
          <SettingsTestnetCard
            address={params.address as Address}
          ></SettingsTestnetCard>
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
