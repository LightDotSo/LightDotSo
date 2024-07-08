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

import type { NftData } from "@lightdotso/data";
import { EmptyState } from "@lightdotso/elements";
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
  }, [columns, isDesktop]);

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
    table?.getColumn("name"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("name")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("name")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("description"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("description")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("description")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("spam_score"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("spam_score")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("spam_score")?.getIsVisible(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain")?.getFacetedUniqueValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain")?.getCanHide(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    table?.getColumn("chain")?.getIsVisible(),
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
                  <EmptyState entity="nft" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </NftsWrapper>
  );
};
