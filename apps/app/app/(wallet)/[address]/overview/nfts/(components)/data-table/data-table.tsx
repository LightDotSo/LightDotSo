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
import { NftCard } from "@/components/nft/nft-card";
import { NftsEmpty } from "@/components/nft/nfts-empty";
import { NftsWrapper } from "@/components/nft/nfts-wrapper";
import type { NftData } from "@/data";
import { useTables } from "@/stores/useTables";

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
  // States
  // ---------------------------------------------------------------------------

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // ---------------------------------------------------------------------------
  // Store
  // ---------------------------------------------------------------------------

  const { setNftTable } = useTables();

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
    },
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
    setNftTable(table);
  }, [
    table,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("chain")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("name")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("description")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table.getColumn("description")?.getIsVisible(),
    setNftTable,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NftsWrapper>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map(row => (
          <>
            <NftCard
              key={row.id}
              nft={row.original}
              showName={row
                .getVisibleCells()
                .some(cell => cell.column.id === "name")}
              showDescription={row
                .getVisibleCells()
                .some(cell => cell.column.id === "description")}
            />
          </>
        ))
      ) : (
        <NftsEmpty />
      )}
    </NftsWrapper>
  );
}
