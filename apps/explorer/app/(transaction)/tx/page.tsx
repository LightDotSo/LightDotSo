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

import { queryKeys } from "@lightdotso/query-keys";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { TransactionsDataTable } from "@/app/(transaction)/(components)/transactions-data-table";
// import { TransactionsDataTablePagination } from "@/app/(transaction)/(components)/transactions-data-table-pagination";
import { handler } from "@/handlers/paths/tx/handler";
import { preloader } from "@/preloaders/paths/tx/preloader";
import { getQueryClient } from "@/services";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  searchParams: {
    isTestnet?: string;
    pagination?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { isTestnetState, paginationState, transactions, transactionsCount } =
    await handler(searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.transaction.list({
      address: undefined,
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      is_testnet: isTestnetState ?? false,
    }).queryKey,
    transactions,
  );
  queryClient.setQueryData(
    queryKeys.transaction.listCount({
      address: undefined,
      is_testnet: isTestnetState ?? false,
    }).queryKey,
    transactionsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionsDataTable isTestnet={isTestnetState ?? false} />
      {/* <TransactionsDataTablePagination /> */}
    </HydrationBoundary>
  );
}
