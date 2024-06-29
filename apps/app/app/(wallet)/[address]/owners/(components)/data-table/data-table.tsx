// Copyright 2023-2024 Light.
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

import type { OwnerData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useTables } from "@lightdotso/stores";
import { OwnerTable } from "@lightdotso/tables";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<OwnerData>[];
  data: OwnerData[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ isLoading, columns, data }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    ownerColumnFilters,
    ownerColumnVisibility,
    ownerRowSelection,
    ownerSorting,
    setOwnerColumnFilters,
    setOwnerColumnVisibility,
    setOwnerRowSelection,
    setOwnerSorting,
    setOwnerTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: ownerSorting,
      columnVisibility: ownerColumnVisibility,
      rowSelection: ownerRowSelection,
      columnFilters: ownerColumnFilters,
      pagination: paginationState,
    },
    onRowSelectionChange: setOwnerRowSelection,
    onSortingChange: setOwnerSorting,
    onColumnFiltersChange: setOwnerColumnFilters,
    onColumnVisibilityChange: setOwnerColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <OwnerTable
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      data={data}
      columns={columns}
      tableOptions={tableOptions}
      setOwnerTable={setOwnerTable}
    />
  );
}
