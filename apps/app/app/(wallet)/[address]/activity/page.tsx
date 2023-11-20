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
import type { Address } from "viem";
import { getTransactions, getQueryClient } from "@/services";
import { ActivityList } from "@/components/activity-list";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "@lightdotso/ui";

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

  await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  const res = await getTransactions(params.address as Address);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return res.match(
    res => {
      queryClient.setQueryData(["transactions", params.address], res);

      return (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<Skeleton className="h-8 w-32"></Skeleton>}>
            <ActivityList address={params.address as Address} />
          </Suspense>
        </HydrationBoundary>
      );
    },
    _ => {
      return null;
    },
  );
}
