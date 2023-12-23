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

import { getConfiguration } from "@lightdotso/client";
import { Table, TableBody, TableCell, TableRow } from "@lightdotso/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import type { Address } from "viem";
import { TransactionCard } from "@/app/(wallet)/[address]/transactions/(components)/transaction/transaction-card";
import { TableEmpty } from "@/components/state/table-empty";
import type { ConfigurationData, UserOperationData } from "@/data";
import { queries } from "@/queries";
import { usePaginationQueryState } from "@/querystates";
import { useTables } from "@/stores";
import { groupByDate } from "@/utils/group";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<UserOperationData>[];
  address: Address;
  data: UserOperationData[];
  pageCount: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({
  columns,
  address,
  data,
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: userOperationSorting,
      columnVisibility: userOperationColumnVisibility,
      rowSelection: userOperationRowSelection,
      columnFilters: userOperationColumnFilters,
      pagination: paginationState,
    },
    pageCount: pageCount,
    paginateExpandedRows: false,
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setUserOperationRowSelection,
    onSortingChange: setUserOperationSorting,
    onColumnFiltersChange: setUserOperationColumnFilters,
    onColumnVisibilityChange: setUserOperationColumnVisibility,
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
    setUserOperationTable(table);
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

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: ConfigurationData | undefined = queryClient.getQueryData(
    queries.configuration.get({ address }).queryKey,
  );

  const { data: configuration } = useQuery<ConfigurationData | null>({
    queryKey: queries.configuration.get({ address }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getConfiguration({
        params: {
          query: {
            address: address,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  const items = table
    .getRowModel()
    .rows.map(row => ({ original: row.original, row }));

  const groupedItems = groupByDate(items);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
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
                      <TransactionCard
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
}
