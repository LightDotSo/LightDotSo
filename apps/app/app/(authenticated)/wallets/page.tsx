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
import { getQueryClient } from "@lightdotso/services";
import type { Address } from "viem";
import { WalletsDataTable } from "@/app/(authenticated)/wallets/(components)/wallets-data-table";
import { WalletsDataTablePagination } from "@/app/(authenticated)/wallets/(components)/wallets-data-table-pagination";
import { WalletsDataTableToolbar } from "@/app/(authenticated)/wallets/(components)/wallets-data-table-toolbar";
import { handler } from "@/handlers/paths/wallets/handler";
import { preloader } from "@/preloaders/paths/wallets/preloader";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  searchParams: {
    pagination?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

// TODO: Add implement session based search params handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function Page({ searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(searchParams);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { paginationState, user, wallets, walletsCount } =
    await handler(searchParams);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  queryClient.setQueryData(
    queryKeys.wallet.list({
      address: user.id === "" ? null : (user.address as Address),
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
      user_id: undefined,
    }).queryKey,
    wallets,
  );
  queryClient.setQueryData(
    queryKeys.wallet.listCount({
      address: user.id === "" ? null : (user.address as Address),
      user_id: undefined,
    }).queryKey,
    walletsCount,
  );

  return (
    <>
      <WalletsDataTableToolbar />
      <WalletsDataTable />
      <WalletsDataTablePagination />
    </>
  );
}
