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

import type { NftData } from "@lightdotso/data";
import { useDebounced, useMediaQuery } from "@lightdotso/hooks";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@lightdotso/ui";
import type {
  ColumnDef,
  TableOptions,
  Table as ReactTable,
} from "@tanstack/react-table";
import {
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
import { TableEmpty } from "../table-empty";
import { NftCard } from "./card";
import { nftColumns } from "./nft-columns";
import { NftsWrapper } from "./nfts-wrapper";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftTableProps = {
  isLoading: boolean;
  pageSize: number;
  data: NftData[] | null;
  tableOptions?: Omit<
    TableOptions<NftData>,
    "data" | "columns" | "getCoreRowModel"
  >;
  columns?: ColumnDef<NftData>[];
  setNftTable?: (tableObject: ReactTable<NftData>) => void;
  limit?: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftTable: FC<NftTableProps> = ({
  isLoading,
  pageSize,
  data,
  tableOptions,
  columns = nftColumns,
  limit,
  setNftTable,
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tableColumns = useMemo(() => {
    if (isDesktop) {
      return columns;
    }
    return columns.filter(column => column.id !== "index");
  }, [columns]);

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
    if (setNftTable) {
      setNftTable(table);
    }
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
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const delayedIsLoading = useDebounced(isLoading, 1000);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NftsWrapper>
      {table.getRowModel().rows?.length ? (
        table
          .getRowModel()
          .rows.slice(0, limit || table.getRowModel().rows?.length)
          .map(row => (
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
      ) : delayedIsLoading ? (
        Array(pageSize)
          .fill(null)
          .map((_, index) => <Skeleton key={index} className="size-24" />)
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
};
