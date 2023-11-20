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

import { handler } from "@/handlers/paths/[address]/handler";
import { handler as pageHandler } from "@/handlers/paths/[address]/overview/handler";
import { getQueryClient } from "@/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { type Address } from "viem";
// import { PortfolioChart } from "@/app/(wallet)/[address]/overview/(components)/portfolio-chart";
import { Suspense } from "react";
import { TokensList } from "@/components/tokens-list";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PageProps {
  params: { address: Address };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(params);

  const { tokens, portfolio } = await pageHandler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  queryClient.setQueryData(["portfolio", params.address], portfolio);
  queryClient.setQueryData(["tokens", params.address], tokens);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <Suspense>
        <PortfolioChart address={params.address as Address} />
      </Suspense> */}
      <Suspense>
        <TokensList address={params.address as Address} />
      </Suspense>
    </HydrationBoundary>
  );
}
