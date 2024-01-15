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
import { useTables } from "@lightdotso/stores";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { usePaginationQueryState } from "@/queryStates";
import { ActivityTable } from "@lightdotso/table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<ActivityData>[];
  data: ActivityData[];
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ columns, data, pageCount }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

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
      columns={columns}
      data={data}
      tableOptions={tableOptions}
      setActivityTable={setActivityTable}
    />
  );
}
