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
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import Link from "next/link";
import { useEffect } from "react";
import type { Address } from "viem";
import { TableEmpty } from "@/components/state/table-empty";
import type { ConfigurationData, UserOperationData } from "@/data";
import { queries } from "@/queries";
import { usePaginationQueryState } from "@/querystates";
import { useTables } from "@/stores";

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
  // Query States
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
            <Collapsible key={row.id} asChild>
              <>
                <CollapsibleTrigger
                  asChild
                  className="cursor-pointer [&[data-state=open]>td>button>svg]:rotate-180"
                  type={undefined}
                >
                  <TableRow>
                    {row.getAllCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <TableCell className="p-0" colSpan={row.getAllCells().length}>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Card className="col-span-1 bg-background-stronger">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Transaction Information
                          </CardTitle>
                          <CardDescription>
                            Get more information about this transaction.
                          </CardDescription>
                        </CardHeader>
                        <CardContent />
                        <CardFooter className="flex w-full items-center justify-end">
                          <Button asChild>
                            <Link
                              href={`/${row.original.sender}/op/${row.original.hash}`}
                            >
                              See More
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="col-span-2 bg-background-stronger">
                        <CardHeader>
                          <CardTitle className="text-lg">Progress</CardTitle>
                          <CardDescription>
                            View the progress of this transaction.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Progress
                              className="col-span-1"
                              value={
                                (row.original.signatures.length /
                                  configuration?.threshold!) *
                                100
                              }
                            />
                            <div className="col-span-1">
                              Threshold: {configuration?.threshold!}/
                              {configuration?.owners?.length!}
                            </div>
                          </div>
                        </CardContent>
                        {row.original.status === "PROPOSED" && (
                          <CardFooter className="flex w-full items-center justify-end">
                            <Button asChild>
                              <Link
                                href={`/${row.original.sender}/op/${row.original.hash}`}
                              >
                                Execute
                              </Link>
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </div>
                  </TableCell>
                </CollapsibleContent>
              </>
            </Collapsible>
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
