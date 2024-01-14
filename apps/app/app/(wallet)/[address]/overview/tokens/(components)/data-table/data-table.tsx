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

import type { TokenData } from "@lightdotso/data";
import { useTables } from "@lightdotso/stores";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
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
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { TableEmpty } from "@/components/state/table-empty";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<TokenData>[];
  data: TokenData[];
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
    tokenColumnFilters,
    tokenColumnVisibility,
    tokenExpandedState,
    tokenRowSelection,
    tokenSorting,
    setTokenColumnFilters,
    setTokenColumnVisibility,
    setTokenExpandedState,
    setTokenRowSelection,
    setTokenSorting,
    setTokenTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: tokenSorting,
      columnVisibility: tokenColumnVisibility,
      rowSelection: tokenRowSelection,
      columnFilters: tokenColumnFilters,
      pagination: paginationState,
      expanded: tokenExpandedState,
    },
    pageCount: pageCount,
    enableExpanding: true,
    enableRowSelection: false,
    manualPagination: true,
    paginateExpandedRows: true,
    onRowSelectionChange: setTokenRowSelection,
    onSortingChange: setTokenSorting,
    onColumnFiltersChange: setTokenColumnFilters,
    onColumnVisibilityChange: setTokenColumnVisibility,
    onExpandedChange: setTokenExpandedState,
    getSubRows: row => row.group?.tokens,
    onPaginationChange: setPaginationState,
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
    setTokenTable(table);
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("sparkline"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("sparkline")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("price"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("price")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("actions"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("actions")?.getIsVisible(),
    setTokenTable,
  ]);

  useEffect(() => {
    if (!table.getIsAllRowsExpanded()) {
      table.toggleAllRowsExpanded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <TableHead key={header.id} style={{ width: header.getSize() }}>
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
          table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              className={cn(
                row.getCanExpand() && "cursor-pointer border-0",
                !row.getIsExpanded() && "border-0",
              )}
              data-state={row.getIsSelected() && "selected"}
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
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <TableEmpty entity="token" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
