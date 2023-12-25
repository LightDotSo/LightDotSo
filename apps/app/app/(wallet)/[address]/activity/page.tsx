/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Address } from "viem";
import { ActivityDataTable } from "@/app/(wallet)/[address]/activity/(components)/activity-data-table";
import { ActivityDataTablePagination } from "@/app/(wallet)/[address]/activity/(components)/activity-data-table-pagination";
import { OVERVIEW_ROW_COUNT } from "@/const/numbers";
import { handler } from "@/handlers/paths/[address]/activity/handler";
import { preloader } from "@/preloaders/paths/[address]/activity/preloader";
import { queries } from "@/queries";
import { getQueryClient } from "@/services";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  params: { address: Address };
  searchParams: {
    pagination?: string;
  };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(params, searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { activities, activitiesCount } = await handler(params, searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queries.activity.list({
      address: params.address as Address,
      limit: OVERVIEW_ROW_COUNT,
      offset: 0,
    }).queryKey,
    activities,
  );
  queryClient.setQueryData(
    queries.activity.listCount({
      address: params.address as Address,
    }).queryKey,
    activitiesCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActivityDataTable address={params.address as Address} />
      <ActivityDataTablePagination />
    </HydrationBoundary>
  );
}
