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

import { TransactionDialog } from "@lightdotso/dialogs";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import type { Address } from "viem";
import { TITLES } from "@/const";
import { handler } from "@/handlers/create/handler";
import { preloader } from "@/preloaders/create/preloader";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    template: `${TITLES.Create.title} | %s`,
    default: TITLES.Create.title,
  },
  description: TITLES.Create.description,
};

// ------------------------------------------------------c-----------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  searchParams: {
    address?: string;
    userOperations?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------

  unstable_noStore();

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { configuration } = await handler(searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  if (configuration) {
    queryClient.setQueryData(
      queryKeys.configuration.get({
        address: searchParams.address as Address,
        checkpoint: 0,
      }).queryKey,
      configuration,
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionDialog address={searchParams.address as Address} />
    </HydrationBoundary>
  );
}
