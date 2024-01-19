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

import type { NotificationData } from "@lightdotso/data";
import { useTables } from "@lightdotso/stores";
import { NotificationTable } from "@lightdotso/table";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<NotificationData>[];
  data: NotificationData[];
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
    notificationColumnFilters,
    notificationColumnVisibility,
    notificationRowSelection,
    notificationSorting,
    setNotificationColumnFilters,
    setNotificationColumnVisibility,
    setNotificationRowSelection,
    setNotificationSorting,
    setNotificationTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table Options
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: notificationSorting,
      columnVisibility: notificationColumnVisibility,
      rowSelection: notificationRowSelection,
      columnFilters: notificationColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    onRowSelectionChange: setNotificationRowSelection,
    onSortingChange: setNotificationSorting,
    onColumnFiltersChange: setNotificationColumnFilters,
    onColumnVisibilityChange: setNotificationColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NotificationTable
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      data={data}
      columns={columns}
      tableOptions={tableOptions}
      setNotificationTable={setNotificationTable}
    />
  );
}
