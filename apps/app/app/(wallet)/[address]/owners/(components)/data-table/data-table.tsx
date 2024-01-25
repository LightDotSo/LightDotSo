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

import type { OwnerData } from "@lightdotso/data";
import { useTables } from "@lightdotso/stores";
import { OwnerTable } from "@lightdotso/tables";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaginationQueryState } from "@lightdotso/nuqs";

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
