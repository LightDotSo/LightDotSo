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

import type { TokenData } from "@lightdotso/data";
import { EmptyState } from "@lightdotso/elements";
import { useDebounced, useMediaQuery } from "@lightdotso/hooks";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import type {
  ColumnDef,
  Table as ReactTable,
  TableOptions,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type FC, useEffect, useMemo } from "react";
import { tokenColumns } from "./token-columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenTableProps = {
  isLoading: boolean;
  pageSize: number;
  data: TokenData[] | null;
  tableOptions?: Omit<
    TableOptions<TokenData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<TokenData>[];
  setTokenTable?: (tableObject: ReactTable<TokenData>) => void;
  limit?: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenTable: FC<TokenTableProps> = ({
  isLoading,
  pageSize,
  data,
  tableOptions,
  columns = tokenColumns,
  limit,
  setTokenTable,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tableColumns = useMemo(() => {
    if (isDesktop) {
      return columns;
    }
    return columns.filter(
      (column) => column.id !== "sparkline" && column.id !== "price",
    );
  }, [columns, isDesktop]);

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    ...tableOptions,
    data: data || [],
    columns: tableColumns,
    enableExpanding: true,
    enableRowSelection: false,
    manualPagination: true,
    paginateExpandedRows: true,
    getSubRows: (row) => row.group?.tokens,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (setTokenTable) {
      setTokenTable(table);
    }
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("chain_id")
      ?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("chain_id")
      ?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("chain_id")
      ?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("sparkline"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("sparkline")
      ?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("price"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("price")
      ?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("actions"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table
      ?.getColumn("actions")
      ?.getIsVisible(),
    setTokenTable,
  ]);

  useEffect(() => {
    if (!table.getIsAllRowsExpanded()) {
      table.toggleAllRowsExpanded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const delayedIsLoading = useDebounced(isLoading, 1000);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table
            .getRowModel()
            .rows.slice(0, limit || table.getRowModel().rows?.length)
            .map((row) => {
              let isLastExpanded = false;

              // Add a flag for handling the last expanded row
              if (row.getIsExpanded()) {
                const parentRow = row.getParentRow();
                if (parentRow) {
                  const subRows = parentRow.getLeafRows();
                  const lastSubRow = subRows[subRows.length - 1];
                  if (lastSubRow === row) {
                    isLastExpanded = true;
                  }
                }
              }

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    row.getCanExpand() && "cursor-pointer",
                    row.getCanExpand() && row.getIsExpanded() && "border-b-0",
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  data-expanded={
                    isLastExpanded
                      ? "false"
                      : row.getParentRow()
                        ? "true"
                        : "false"
                  }
                  data-expanded-last={isLastExpanded && "true"}
                  onClick={() => {
                    if (row.getCanExpand()) {
                      row.getToggleExpandedHandler()();
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
        ) : delayedIsLoading ? (
          Array(pageSize)
            .fill(null)
            .map((_, index) => (
              <TableRow key={`loading-${index}`}>
                {table.getVisibleLeafColumns().map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ width: column.getSize() }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <EmptyState entity="token" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
