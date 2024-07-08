// Copyright 2023-2024 LightDotSo.
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

import type { NftData } from "@lightdotso/data";
import { useQueryNfts, useQueryWalletSettings } from "@lightdotso/query";
import { useTables } from "@lightdotso/stores";
import { NftTable } from "@lightdotso/tables";
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

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { nftPage } = useQueryNfts({
    address: address as Address,
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
