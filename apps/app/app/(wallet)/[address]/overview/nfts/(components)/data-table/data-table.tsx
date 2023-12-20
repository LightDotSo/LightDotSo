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

import { Table, TableBody, TableCell, TableRow } from "@lightdotso/ui";
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
import { NftCard } from "@/components/nft/nft-card";
import { NftsWrapper } from "@/components/nft/nfts-wrapper";
import { TableEmpty } from "@/components/state/table-empty";
import type { NftData } from "@/data";
import { usePaginationQueryState } from "@/querystates";
import { useTables } from "@/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableProps {
  columns: ColumnDef<NftData>[];
  data: NftData[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTable({ columns, data }: DataTableProps) {
  // ---------------------------------------------------------------------------
  // Query States
  // ---------------------------------------------------------------------------

  const [paginationState, setPaginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    nftColumnFilters,
    nftColumnVisibility,
    nftRowSelection,
    nftSorting,
    setNftColumnFilters,
    setNftColumnVisibility,
    setNftRowSelection,
    setNftSorting,
    setNftTable,
  } = useTables();

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: nftSorting,
      columnVisibility: nftColumnVisibility,
      rowSelection: nftRowSelection,
      columnFilters: nftColumnFilters,
      pagination: paginationState,
    },
    pageCount: 50,
    paginateExpandedRows: false,
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setNftRowSelection,
    onSortingChange: setNftSorting,
    onColumnFiltersChange: setNftColumnFilters,
    onColumnVisibilityChange: setNftColumnVisibility,
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
    setNftTable(table);
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("description"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("description")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("description")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("spam_score"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("spam_score")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("spam_score")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain")?.getIsVisible(),
    setNftTable,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NftsWrapper>
      {table.getRowModel().rows?.length ? (
        table
          .getRowModel()
          .rows.map(row => (
            <NftCard
              key={row.id}
              nft={row.original}
              showName={row
                .getVisibleCells()
                .some(cell => cell.column.id === "name")}
              showDescription={row
                .getVisibleCells()
                .some(cell => cell.column.id === "description")}
              showSpamScore={row
                .getVisibleCells()
                .some(cell => cell.column.id === "spam_score")}
              showChain={row
                .getVisibleCells()
                .some(cell => cell.column.id === "chain")}
            />
          ))
      ) : (
        <div className="col-span-6">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <TableEmpty entity="nft" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </NftsWrapper>
  );
}
