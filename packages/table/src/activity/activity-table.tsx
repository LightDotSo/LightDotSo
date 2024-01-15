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

import type { ActivityData } from "@lightdotso/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
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
import { useEffect, type FC } from "react";
import { TableEmpty } from "../state/table-empty";
import { activityColumns } from "./activity-columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ActivityTableProps = {
  data: ActivityData[] | null;
  tableOptions?: Omit<
    TableOptions<ActivityData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<ActivityData>[];
  setActivityTable?: (tableObject: ReactTable<ActivityData>) => void;
  limit?: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ActivityTable: FC<ActivityTableProps> = ({
  data,
  tableOptions,
  columns = activityColumns,
  limit,
  setActivityTable,
}) => {
  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    ...tableOptions,
    data: data || [],
    columns,
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

  useEffect(() => {
    if (setActivityTable) {
      setActivityTable(table);
    }
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("address"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("address")?.getFilterValue(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("entity"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("entity")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("entity")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("entity")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("operation"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("operation")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("operation")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("timestamp"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("timestamp")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("timestamp")?.getIsVisible(),
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
};
