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

"use client";

import type { NftData, WalletSettingsData } from "@lightdotso/data";
import { useQueryNfts } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useTables } from "@lightdotso/stores";
import { NftTable } from "@lightdotso/tables";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type NftsListProps = {
  address: Address;
  limit: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftsList: FC<NftsListProps> = ({ address, limit }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { nftColumnFilters, nftColumnVisibility, nftRowSelection, nftSorting } =
    useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { nftPage } = useQueryNfts({
    address: address,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    cursor: null,
  });

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: nftSorting,
      columnVisibility: nftColumnVisibility,
      rowSelection: nftRowSelection,
      columnFilters: nftColumnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
    paginateExpandedRows: false,
    enableRowSelection: false,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NftTable
      isLoading={false}
      limit={limit}
      pageSize={limit}
      data={nftPage && nftPage.nfts ? nftPage.nfts : ([] as NftData[])}
      tableOptions={tableOptions}
    />
  );
};
