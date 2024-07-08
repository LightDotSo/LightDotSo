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

"use client";

import type { TokenData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/templates";
import type { ColumnDef } from "@tanstack/react-table";
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
    cell: ({ row }) => (
      <TokenCardChain
        token={row.original}
        isGrouped={
          typeof row.getParentRow() === "undefined" && row.getCanExpand()
        }
        leafTokens={row.getLeafRows().map(r => r.original)}
      />
    ),
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
      <TokenCardSparkline
        token={row.original}
        isExpanded={typeof row.getParentRow() !== "undefined"}
      />
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
      <TokenCardPrice
        token={row.original}
        isExpanded={typeof row.getParentRow() !== "undefined"}
      />
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
    cell: ({ row }) => <TokenTableRowActions token={row.original} />,
    enableSorting: false,
    enableHiding: true,
  },
];
