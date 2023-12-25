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
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TableEmpty } from "@/components/state/table-empty";
import type { ActivityData } from "@/data";
import { usePaginationQueryState } from "@/querystates";
import { useTables } from "@/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<ActivityData>[];
  data: ActivityData[];
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ columns, data, pageCount }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    walletColumnFilters,
    walletColumnVisibility,
    walletRowSelection,
    walletSorting,
    setWalletColumnFilters,
    setWalletColumnVisibility,
    setWalletRowSelection,
    setWalletSorting,
    setActivityTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: walletSorting,
      columnVisibility: walletColumnVisibility,
      rowSelection: walletRowSelection,
      columnFilters: walletColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    paginateExpandedRows: false,
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setWalletRowSelection,
    onSortingChange: setWalletSorting,
    onColumnFiltersChange: setWalletColumnFilters,
    onColumnVisibilityChange: setWalletColumnVisibility,
    onPaginationChange: setPaginationState,
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
    setActivityTable(table);
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("address"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("address")?.getFilterValue(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getIsVisible(),
    setActivityTable,
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
              className="cursor-pointer"
              data-state={row.getIsSelected() && "selected"}
              onClick={() => router.push(`/${row.original.id}`)}
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
              <TableEmpty entity="activity" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
