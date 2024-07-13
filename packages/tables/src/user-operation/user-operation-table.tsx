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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
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
import type { Address } from "viem";
import { groupByDate } from "../group";
import { UserOperationCardTransaction } from "./card";
import { userOperationColumns } from "./user-operation-columns";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type UserOperationTableProps = {
  isDefaultOpen?: boolean;
  isLoading: boolean;
  pageSize: number;
  data: UserOperationData[] | null;
  configuration?: ConfigurationData;
  address: Address | null;
  isTestnet: boolean;
  tableOptions?: Omit<
    TableOptions<UserOperationData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<UserOperationData>[];
  tableType?: "user-operation-details" | "user-operation-tabular";
  setUserOperationTable?: (tableObject: ReactTable<UserOperationData>) => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationTable: FC<UserOperationTableProps> = ({
  isDefaultOpen = false,
  isLoading,
  pageSize,
  data,
  configuration,
  tableOptions,
  address,
  isTestnet,
  tableType = "user-operation-tabular",
  columns = userOperationColumns,
  setUserOperationTable,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const delayedIsLoading = useDebounced(isLoading, 1000);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tableColumns = useMemo(() => {
    if (address === null) {
      return columns.filter(column => column.id !== "toggle");
    }
    if (isDesktop) {
      return columns.filter(column => column.id !== "row_actions");
    }
    // Filter out columns w/ id `row_actions`
    return columns.filter(column => column.id !== "row_actions");
  }, [address, columns, isDesktop]);

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

  useEffect(() => {
    if (setUserOperationTable) {
      setUserOperationTable(table);
    }
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain_id")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("status")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("status")?.getIsVisible(),
    setUserOperationTable,
  ]);

  useEffect(() => {
    if (!table.getIsAllRowsExpanded()) {
      table.toggleAllRowsExpanded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const items = table
    .getRowModel()
    .rows.map(row => ({ original: row.original, row: row }));

  const groupedItems = groupByDate(items);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (tableType !== "user-operation-tabular") {
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
                <EmptyState entity="transaction" />
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
                {itemsInSameDate.map(({ original: userOperation, row }) => (
                  <UserOperationCardTransaction
                    key={userOperation.hash}
                    isDefaultOpen={isDefaultOpen}
                    address={address}
                    isTestnet={isTestnet}
                    configuration={configuration}
                    userOperation={userOperation}
                    row={row}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <EmptyState entity="transaction" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
};
