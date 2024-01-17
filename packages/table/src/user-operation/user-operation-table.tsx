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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { useDebounced } from "@lightdotso/hooks";
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
import { useEffect, type FC } from "react";
import type { Address } from "viem";
import { groupByDate } from "../group";
import { TableEmpty } from "../state/table-empty";
import { UserOperationCardTransaction } from "./card/user-operation-card-transaction";
import { userOperationColumns } from "./user-operation-columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationTableProps = {
  isLoading: boolean;
  data: UserOperationData[] | null;
  configuration?: ConfigurationData;
  address: Address | null;
  tableOptions?: Omit<
    TableOptions<UserOperationData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<UserOperationData>[];
  setUserOperationTable?: (tableObject: ReactTable<UserOperationData>) => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationTable: FC<UserOperationTableProps> = ({
  isLoading,
  data,
  configuration,
  tableOptions,
  address,
  columns = userOperationColumns,
  setUserOperationTable,
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
    if (setUserOperationTable) {
      setUserOperationTable(table);
    }
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
    setUserOperationTable,
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
  // Local Variables
  // ---------------------------------------------------------------------------

  const items = table
    .getRowModel()
    .rows.map(row => ({ original: row.original, row }));

  const groupedItems = groupByDate(items);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (address === null) {
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
              .rows.slice(0, table.getRowModel().rows?.length)
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : delayedIsLoading ? (
            Array(10)
              .fill(null)
              .map((_, index) => (
                <TableRow key={index}>
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
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {Object.keys(groupedItems).length > 0 && configuration ? (
        <>
          {Object.entries(groupedItems).map(([date, itemsInSameDate]) => (
            <div key={date} className="mb-4 space-y-3">
              <div className="text-text-weak">{date}</div>
              <div className="rounded-md border border-border bg-background">
                <Table>
                  <TableBody className="overflow-hidden">
                    {itemsInSameDate.map(({ original: userOperation, row }) => (
                      <UserOperationCardTransaction
                        key={userOperation.hash}
                        address={address}
                        configuration={configuration}
                        userOperation={userOperation}
                        row={row}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </>
      ) : (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <TableEmpty entity="transaction" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
};
