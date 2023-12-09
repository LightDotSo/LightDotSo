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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { TransactionData } from "@/data";
import { useTables } from "@/stores/useTables";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<TransactionData>[];
  data: TransactionData[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ columns, data }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // States
  // ---------------------------------------------------------------------------

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ["spam_score"]: false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "spam_score",
      value: "0",
    },
  ]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // ---------------------------------------------------------------------------
  // Store
  // ---------------------------------------------------------------------------

  const { setTransactionTable } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: -1,
      },
    },
    paginateExpandedRows: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setTransactionTable(table);
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain_id")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("hash")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("hash")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("timestamp")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("timestamp")?.getIsVisible(),
    setTransactionTable,
  ]);

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
          table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
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
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
