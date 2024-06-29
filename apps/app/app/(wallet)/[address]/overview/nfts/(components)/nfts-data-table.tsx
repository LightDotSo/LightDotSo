// Copyright 2023-2024 Light
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import { useCursorQueryState, usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryNfts, useQueryWalletSettings } from "@lightdotso/query";
import { nftColumns } from "@lightdotso/tables";
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

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { nftPage, isNftsLoading } = useQueryNfts({
    address: address as Address,
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
