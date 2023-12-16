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

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";
import { TransactionsDataTable } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table";
import { TransactionsDataTablePagination } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table-pagination";
import { handler } from "@/handlers/paths/[address]/transactions/handler";
import { preloader } from "@/preloaders/paths/[address]/preloader";
import { queries } from "@/queries";
import { getQueryClient } from "@/services";

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

  const { walletSettings, userOperations, userOperationsCount } =
    await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queries.wallet.settings(params.address as Address).queryKey,
    walletSettings,
  );
  queryClient.setQueryData(
    queries.user_operation.list({
      address: params.address as Address,
      status: "proposed",
      direction: "asc",
      limit: 10,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperations,
  );
  queryClient.setQueryData(
    queries.user_operation.listCount({
      address: params.address as Address,
      status: "proposed",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperationsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsDataTable
        address={params.address as Address}
        status="proposed"
      />
      <TransactionsDataTablePagination />
    </HydrationBoundary>
  );
}
