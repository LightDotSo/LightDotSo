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

import type { TransactionData } from "@lightdotso/data";
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
  TableOptions,
  Table as ReactTable,
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
import { useEffect, type FC, useMemo } from "react";
import { TableEmpty } from "../table-empty";
import { transactionColumns } from "./transaction-columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionTableProps = {
  data: TransactionData[] | null;
  pageSize: number;
  tableOptions?: Omit<
    TableOptions<TransactionData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<TransactionData>[];
  setTransactionTable?: (tableObject: ReactTable<TransactionData>) => void;
  isLoading: boolean;
  limit?: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionTable: FC<TransactionTableProps> = ({
  data,
  tableOptions,
  columns = transactionColumns,
  isLoading,
  pageSize,
  limit,
  setTransactionTable,
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
    return columns.filter(column => column.id !== "timestamp");
  }, [columns, isDesktop]);

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    ...tableOptions,
    data: data || [],
    columns: tableColumns,
    enableExpanding: false,
    enableRowSelection: false,
    manualPagination: true,
    paginateExpandedRows: true,
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
    if (!isLoading && setTransactionTable) {
      setTransactionTable(table);
    }
  }, [
    isLoading,
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getIsVisible(),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("sparkline"),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("sparkline")?.getIsVisible(),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("price"),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("price")?.getIsVisible(),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("actions"),
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // table?.getColumn("actions")?.getIsVisible(),
    setTransactionTable,
  ]);

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
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
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
            .map(row => (
              <TableRow
                key={row.id}
                className={cn(
                  row.getCanExpand() && "cursor-pointer",
                  row.getCanExpand() && row.getIsExpanded() && "border-b-0",
                )}
                data-state={row.getIsSelected() && "selected"}
                data-expanded={row.getParentRow() ? "true" : "false"}
                onClick={() => {
                  if (row.getCanExpand()) {
                    row.getToggleExpandedHandler()();
                  }
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
        ) : delayedIsLoading ? (
          Array(pageSize)
            .fill(null)
            .map((_, index) => (
              <TableRow key={`loading-${index}`}>
                {table.getVisibleLeafColumns().map(column => (
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
              <TableEmpty entity="transaction" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
