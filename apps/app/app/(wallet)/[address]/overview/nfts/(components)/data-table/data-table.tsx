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

import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import type { NftData } from "@lightdotso/data";
import { useCursorQueryState, usePaginationQueryState } from "@lightdotso/nuqs";
import { useTables } from "@lightdotso/stores";
import { NftTable } from "@lightdotso/tables";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<NftData>[];
  data: NftData[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ isLoading, columns, data }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [cursorState] = useCursorQueryState();
  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    nftColumnFilters,
    nftColumnVisibility,
    nftRowSelection,
    nftSorting,
    setNftColumnFilters,
    setNftColumnVisibility,
    setNftRowSelection,
    setNftSorting,
    setNftTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const tableOoptions = {
    state: {
      sorting: nftSorting,
      columnVisibility: nftColumnVisibility,
      rowSelection: nftRowSelection,
      columnFilters: nftColumnFilters,
      pagination: paginationState,
    },
    pageCount: cursorState
      ? paginationState.pageIndex + 2
      : paginationState.pageIndex + 1,
    paginateExpandedRows: false,
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setNftRowSelection,
    onSortingChange: setNftSorting,
    onColumnFiltersChange: setNftColumnFilters,
    onColumnVisibilityChange: setNftColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NftTable
      isLoading={isLoading}
      pageSize={SIMPLEHASH_MAX_COUNT}
      data={data}
      columns={columns}
      tableOptions={tableOoptions}
      setNftTable={setNftTable}
    />
  );
}
