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

import { Separator } from "@lightdotso/ui";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";
import { OverviewSection } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-section";
import { TransactionsDataTable } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table";
import { TRANSACTION_ROW_COUNT } from "@/const/numbers";
import { handler } from "@/handlers/paths/[address]/transactions/handler";
import { preloader } from "@/preloaders/paths/[address]/transactions/preloader";
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

  const {
    walletSettings,
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  } = await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queries.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );
  queryClient.setQueryData(
    queries.user_operation.list({
      address: params.address as Address,
      status: "proposed",
      direction: "asc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperations,
  );
  queryClient.setQueryData(
    queries.user_operation.listCount({
      address: params.address as Address,
      status: "proposed",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperationsCount,
  );
  queryClient.setQueryData(
    queries.user_operation.list({
      address: params.address as Address,
      status: "history",
      direction: "desc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    historyUserOperations,
  );
  queryClient.setQueryData(
    queries.user_operation.listCount({
      address: params.address as Address,
      status: "history",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    historyUserOperationsCount,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewSection
        title="Queue"
        href={`/${params.address}/transactions/queue`}
      >
        <TransactionsDataTable
          address={params.address as Address}
          status="proposed"
        />
      </OverviewSection>
      <Separator className="my-4" />
      <OverviewSection
        title="History"
        href={`/${params.address}/transactions/history`}
      >
        <TransactionsDataTable
          address={params.address as Address}
          status="history"
        />
      </OverviewSection>
    </HydrationBoundary>
  );
}
