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

import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import { queryKeys } from "@lightdotso/query-keys";
import { getQueryClient } from "@lightdotso/services";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Address } from "viem";
import { OverviewSection } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-section";
import { OverviewSectionEmpty } from "@/app/(wallet)/[address]/transactions/(components)/overview/overview-section-empty";
import { TransactionsDataTable } from "@/app/(wallet)/[address]/transactions/(components)/transactions-data-table";
import { handler } from "@/handlers/paths/[address]/transactions/handler";
import { preloader } from "@/preloaders/paths/[address]/transactions/preloader";

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
    userOperationsCount,
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
    queryKeys.wallet.settings({ address: params.address as Address }).queryKey,
    walletSettings,
  );
  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: null,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    userOperationsCount,
  );
  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: params.address as Address,
      status: "queued",
      order: "asc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperations,
  );
  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
      address: params.address as Address,
      status: "queued",
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queuedUserOperationsCount,
  );
  queryClient.setQueryData(
    queryKeys.user_operation.list({
      address: params.address as Address,
      status: "history",
      order: "desc",
      limit: TRANSACTION_ROW_COUNT,
      offset: 0,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    historyUserOperations,
  );
  queryClient.setQueryData(
    queryKeys.user_operation.listCount({
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
        address={params.address as Address}
        status="queued"
        title="Queue"
        href={`/${params.address}/transactions/queue`}
      >
        <TransactionsDataTable
          address={params.address as Address}
          status="queued"
        />
      </OverviewSection>
      <OverviewSection
        address={params.address as Address}
        status="history"
        title="History"
        href={`/${params.address}/transactions/history`}
      >
        <TransactionsDataTable
          address={params.address as Address}
          status="history"
        />
      </OverviewSection>
      <OverviewSectionEmpty address={params.address as Address} />
    </HydrationBoundary>
  );
}
