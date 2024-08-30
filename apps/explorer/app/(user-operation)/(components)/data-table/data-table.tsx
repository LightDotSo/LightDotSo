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

import type { UserOperationData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryConfiguration } from "@lightdotso/query";
import { useTables } from "@lightdotso/stores";
import { UserOperationTable } from "@lightdotso/tables/user-operation";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  isDefaultOpen?: boolean;
  isLoading: boolean;
  columns: ColumnDef<UserOperationData>[];
  data: UserOperationData[];
  isTestnet: boolean;
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({
  isDefaultOpen,
  isLoading,
  columns,
  data,
  isTestnet,
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
      isDefaultOpen={isDefaultOpen}
      isLoading={isLoading}
      pageSize={paginationState.pageSize}
      address={null}
      isTestnet={isTestnet}
      columns={columns}
      data={data}
      configuration={configuration ?? undefined}
      tableOptions={tableOptions}
      setUserOperationTable={setUserOperationTable}
    />
  );
}
