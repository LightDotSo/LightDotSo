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

import type { WalletSettingsData } from "@lightdotso/data";
import { useSuspenseQueryTokens } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useTables } from "@lightdotso/stores";
import { TokenTable } from "@lightdotso/table";
import { useQueryClient } from "@tanstack/react-query";
import { type FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TokensListProps = {
  address: Address;
  limit: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokensList: FC<TokensListProps> = ({ address, limit }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    tokenColumnFilters,
    tokenColumnVisibility,
    tokenExpandedState,
    tokenRowSelection,
    tokenSorting,
    setTokenExpandedState,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { tokens } = useSuspenseQueryTokens({
    address: address,
    limit: limit,
    offset: 0,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    group: true,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Table Options
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: tokenSorting,
      columnVisibility: tokenColumnVisibility,
      rowSelection: tokenRowSelection,
      columnFilters: tokenColumnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
      expanded: tokenExpandedState,
    },
    enableExpanding: true,
    enableRowSelection: false,
    manualPagination: true,
    paginateExpandedRows: true,
    onExpandedChange: setTokenExpandedState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TokenTable
      isLoading={false}
      pageSize={limit}
      data={tokens}
      tableOptions={tableOptions}
    />
  );
};
