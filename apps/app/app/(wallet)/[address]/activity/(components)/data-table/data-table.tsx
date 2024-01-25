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

import type { ActivityData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useTables } from "@lightdotso/stores";
import { ActivityTable } from "@lightdotso/tables";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<ActivityData>[];
  data: ActivityData[];
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
    activityColumnFilters,
    activityColumnVisibility,
    activityRowSelection,
    activitySorting,
    setActivityColumnFilters,
    setActivityColumnVisibility,
    setActivityRowSelection,
    setActivitySorting,
    setActivityTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table Options
  // ---------------------------------------------------------------------------

  const tableOptions = {
    data,
    columns,
    state: {
      sorting: activitySorting,
      columnVisibility: activityColumnVisibility,
      rowSelection: activityRowSelection,
      columnFilters: activityColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    onRowSelectionChange: setActivityRowSelection,
    onSortingChange: setActivitySorting,
    onColumnFiltersChange: setActivityColumnFilters,
    onColumnVisibilityChange: setActivityColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ActivityTable
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      columns={columns}
      data={data}
      tableOptions={tableOptions}
      setActivityTable={setActivityTable}
    />
  );
}
