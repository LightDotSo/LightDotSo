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

import type { TokenData, WalletSettingsData } from "@lightdotso/data";
import { useSuspenseQueryTokens } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useTables } from "@lightdotso/stores";
import { columns } from "@lightdotso/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { useQueryClient } from "@tanstack/react-query";
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
import { TableEmpty } from "@/components/state/table-empty";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TokensListProps = {
  address: Address;
  limit: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokensList: FC<TokensListProps> = ({ address, limit }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    tokenColumnFilters,
    tokenColumnVisibility,
    tokenExpandedState,
    tokenRowSelection,
    tokenSorting,
    setTokenExpandedState,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { tokens } = useSuspenseQueryTokens({
    address: address,
    limit: limit,
    offset: 0,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    group: true,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data: tokens ?? ([] as TokenData[]),
    columns: columns,
    state: {
      sorting: tokenSorting,
      columnVisibility: tokenColumnVisibility,
      rowSelection: tokenRowSelection,
      columnFilters: tokenColumnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
      expanded: tokenExpandedState,
    },
    enableExpanding: true,
    enableRowSelection: false,
    manualPagination: true,
    paginateExpandedRows: true,
    onExpandedChange: setTokenExpandedState,
    getSubRows: row => row.group?.tokens,
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
};
