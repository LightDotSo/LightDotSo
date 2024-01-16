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

import type { TransactionData } from "@lightdotso/data";
import { useTables } from "@lightdotso/stores";
import { TransactionTable } from "@lightdotso/table";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<TransactionData>[];
  data: TransactionData[];
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ columns, data, pageCount }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    transactionColumnFilters,
    transactionColumnVisibility,
    transactionRowSelection,
    transactionSorting,
    setTransactionColumnFilters,
    setTransactionColumnVisibility,
    setTransactionRowSelection,
    setTransactionSorting,
    setTransactionTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const tableOptions = {
    state: {
      sorting: transactionSorting,
      columnVisibility: transactionColumnVisibility,
      rowSelection: transactionRowSelection,
      columnFilters: transactionColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    paginateExpandedRows: false,
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setTransactionRowSelection,
    onSortingChange: setTransactionSorting,
    onColumnFiltersChange: setTransactionColumnFilters,
    onColumnVisibilityChange: setTransactionColumnVisibility,
    onPaginationChange: setPaginationState,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TransactionTable
      data={data}
      columns={columns}
      tableOptions={tableOptions}
      setTransactionTable={setTransactionTable}
    />
  );
}
