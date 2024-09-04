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

import type { TransactionData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useTables } from "@lightdotso/stores";
import { TransactionTable } from "@lightdotso/tables/transaction";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isLoading: boolean;
  columns: ColumnDef<TransactionData>[];
  data: TransactionData[];
  pageSize?: number;
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({
  isLoading,
  columns,
  data,
  pageSize,
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
      isLoading={isLoading}
      pageSize={pageSize ?? paginationState.pageSize}
      data={data}
      columns={columns}
      tableOptions={tableOptions}
      setTransactionTable={setTransactionTable}
    />
  );
}
