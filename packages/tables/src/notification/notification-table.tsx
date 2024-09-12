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

import type { NotificationData } from "@lightdotso/data";
import { EmptyState } from "@lightdotso/elements/empty-state";
import { useDebounced, useMediaQuery } from "@lightdotso/hooks";
import { Skeleton } from "@lightdotso/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui/components/table";
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
import { notificationColumns } from "./columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NotificationTableProps = {
  isLoading: boolean;
  pageSize: number;
  data: NotificationData[] | null;
  tableOptions?: Omit<
    TableOptions<NotificationData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<NotificationData>[];
  setNotificationTable?: (tableObject: ReactTable<NotificationData>) => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationTable: FC<NotificationTableProps> = ({
  isLoading,
  pageSize,
  data,
  tableOptions,
  columns = notificationColumns,
  setNotificationTable,
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
    return columns.filter((column) => column.id !== "index");
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (setNotificationTable) {
      setNotificationTable(table);
    }
  }, [
    table,
    table?.getColumn("address"),
    table?.getColumn("address")?.getFilterValue(),
    table?.getColumn("name"),
    table?.getColumn("name")?.getFacetedUniqueValues(),
    table?.getColumn("name")?.getCanHide(),
    table?.getColumn("name")?.getIsVisible(),
    setNotificationTable,
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
        {table.getRowModel().rows?.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : delayedIsLoading ? (
          new Array(pageSize).fill(null).map((_, index) => (
            <TableRow
              key={`loading-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
            >
              {table.getVisibleLeafColumns().map((column) => (
                <TableCell key={column.id} style={{ width: column.getSize() }}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <EmptyState entity="notification" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
