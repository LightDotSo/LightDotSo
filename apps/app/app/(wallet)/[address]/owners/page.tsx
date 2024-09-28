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

import { OwnersDataTable } from "@/app/(wallet)/[address]/owners/(components)/owners-data-table";
import { handler } from "@/handlers/[address]/owners/handler";
import { preloader } from "@/preloaders/[address]/owners/preloader";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { unstable_noStore } from "next/cache";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type PageProps = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{
    pagination?: string;
  }>;
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------

  unstable_noStore();

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(await params, await searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { configuration, walletSettings } = await handler(
    await params,
    await searchParams,
  );

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.settings({ address: (await params).address as Address })
      .queryKey,
    walletSettings,
  );

  queryClient.setQueryData(
    queryKeys.configuration.get({
      address: (await params).address as Address,
    }).queryKey,
    configuration,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OwnersDataTable address={(await params).address as Address} />
    </HydrationBoundary>
  );
}
