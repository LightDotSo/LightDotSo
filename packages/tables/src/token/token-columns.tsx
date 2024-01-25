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
import { DataTableColumnHeader } from "@lightdotso/templates";
import type { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { TokenTableRowActions } from "./actions";
import {
  TokenCardBalance,
  TokenCardChain,
  TokenCardPrice,
  TokenCardSparkline,
  TokenCardToken,
} from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const tokenColumns: ColumnDef<TokenData>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-20 md:w-48"
        column={column}
        title="Name"
      />
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
  },
  {
    id: "balance_usd",
    accessorKey: "balance_usd",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-16 md:w-64"
        column={column}
        title="Balance"
      />
    ),
    cell: ({ row }) => <TokenCardBalance token={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "chain_id",
    accessorKey: "chain_id",
    header: ({ column }) => (
      <DataTableColumnHeader className="w-16" column={column} title="Chain" />
    ),
    cell: ({ row }) => <TokenCardChain token={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "sparkline",
    accessorKey: "sparkline",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-24"
        column={column}
        title="Last 7 Days"
      />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardSparkline
          token={row.original}
          isExpanded={typeof row.getParentRow() !== "undefined"}
        />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "price",
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader className="w-10" column={column} title="Price" />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardPrice
          token={row.original}
          isExpanded={typeof row.getParentRow() !== "undefined"}
        />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
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
        <TokenTableRowActions token={row.original} />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
  },
];
