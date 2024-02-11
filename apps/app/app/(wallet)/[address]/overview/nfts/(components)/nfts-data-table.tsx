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

import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import type { WalletSettingsData } from "@lightdotso/data";
import { useCursorQueryState, usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryNfts } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { nftColumns } from "@lightdotso/tables";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/overview/nfts/(components)/data-table/data-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface NftsDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftsDataTable: FC<NftsDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [cursorState, setCursorState] = useCursorQueryState();
  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { nftPage, isNftsLoading } = useQueryNfts({
    address: address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: SIMPLEHASH_MAX_COUNT,
    cursor: paginationState.pageIndex === 0 ? null : cursorState,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Set the cursor state if there is a next cursor
    if (nftPage?.next_cursor) {
      setCursorState(nftPage.next_cursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftPage?.next_cursor, setCursorState, paginationState.pageIndex]);

  // Only run once on mount
  useEffect(() => {
    // Set the paginationSize to the `SIMPLEHASH_MAX_COUNT`
    setPaginationState(prev => ({ ...prev, pageSize: SIMPLEHASH_MAX_COUNT }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!nftPage) {
    return null;
  }

  return (
    <DataTable
      isLoading={isNftsLoading}
      data={nftPage.nfts ?? []}
      columns={nftColumns}
    />
  );
};
