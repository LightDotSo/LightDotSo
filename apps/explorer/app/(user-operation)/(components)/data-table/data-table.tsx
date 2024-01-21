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

import type { UserOperationData } from "@lightdotso/data";
import { useQueryConfiguration } from "@lightdotso/query";
import { useTables } from "@lightdotso/stores";
import { UserOperationTable } from "@lightdotso/tables";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<UserOperationData>[];
  data: UserOperationData[];
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
    userOperationColumnFilters,
    userOperationColumnVisibility,
    userOperationRowSelection,
    userOperationSorting,
    setUserOperationColumnFilters,
    setUserOperationColumnVisibility,
    setUserOperationRowSelection,
    setUserOperationSorting,
    setUserOperationTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: userOperationSorting,
      columnVisibility: userOperationColumnVisibility,
      rowSelection: userOperationRowSelection,
      columnFilters: userOperationColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    onRowSelectionChange: setUserOperationRowSelection,
    onSortingChange: setUserOperationSorting,
    onColumnFiltersChange: setUserOperationColumnFilters,
    onColumnVisibilityChange: setUserOperationColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: null,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <UserOperationTable
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      address={null}
      columns={columns}
      data={data}
      configuration={configuration ?? undefined}
      tableOptions={tableOptions}
      setUserOperationTable={setUserOperationTable}
    />
  );
}
