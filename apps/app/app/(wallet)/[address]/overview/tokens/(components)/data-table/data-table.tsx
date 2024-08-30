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

import type { TokenData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useTables } from "@lightdotso/stores";
import { TokenTable } from "@lightdotso/tables/token";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<TokenData>[];
  data: TokenData[];
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({
  isLoading,
  columns,
  data,
  pageCount,
}: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    tokenColumnFilters,
    tokenColumnVisibility,
    tokenExpandedState,
    tokenRowSelection,
    tokenSorting,
    setTokenColumnFilters,
    setTokenColumnVisibility,
    setTokenExpandedState,
    setTokenRowSelection,
    setTokenSorting,
    setTokenTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table Options
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: tokenSorting,
      columnVisibility: tokenColumnVisibility,
      rowSelection: tokenRowSelection,
      columnFilters: tokenColumnFilters,
      pagination: paginationState,
      expanded: tokenExpandedState,
    },
    pageCount: pageCount,
    onRowSelectionChange: setTokenRowSelection,
    onSortingChange: setTokenSorting,
    onColumnFiltersChange: setTokenColumnFilters,
    onColumnVisibilityChange: setTokenColumnVisibility,
    onExpandedChange: setTokenExpandedState,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TokenTable
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      columns={columns}
      data={data}
      tableOptions={tableOptions}
      setTokenTable={setTokenTable}
    />
  );
}
