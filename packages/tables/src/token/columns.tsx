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

import type { TokenData } from "@lightdotso/data";
import type { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { DataTableColumnHeader } from "../../templates/data-table/data-table-column-header";
import { TokenCardActions } from "./card/token-card-actions";
import { TokenCardBalance } from "./card/token-card-balance";
import { TokenCardChain } from "./card/token-card-chain";
import { TokenCardPrice } from "./card/token-card-price";
import { TokenCardSparkline } from "./card/token-card-sparkline";
import { TokenCardToken } from "./card/token-card-token";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const columns: ColumnDef<TokenData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <TokenCardToken
        token={row.original}
        canExpand={row.getCanExpand()}
        isExpanded={row.getIsExpanded()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 416,
  },
  {
    accessorKey: "balance_usd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => <TokenCardBalance token={row.original} />,
    enableSorting: false,
    enableHiding: false,
    size: 416,
  },
  {
    accessorKey: "chain_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chain" />
    ),
    cell: ({ row }) => <TokenCardChain token={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
    enableSorting: false,
    enableHiding: true,
    size: 208,
  },
  {
    accessorKey: "sparkline",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last 7 Days" />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardSparkline token={row.original} />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
    size: 146,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardPrice token={row.original} />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
    size: 96,
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Actions"
        className="text-right"
      />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardActions token={row.original} />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
    size: 96,
  },
];
