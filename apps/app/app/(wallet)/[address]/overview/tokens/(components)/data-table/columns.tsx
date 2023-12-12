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

import { Number } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { DataTableColumnHeader } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/data-table-column-header";
import { TokenCardActions } from "@/components/token/token-card-actions";
import { TokenCardPrice } from "@/components/token/token-card-price";
import { TokenCardSparkline } from "@/components/token/token-card-sparkline";
import { TokenCardToken } from "@/components/token/token-card-token";
import type { TokenData } from "@/data";
import { getChainNameById } from "@/utils/chain";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const columns: ColumnDef<TokenData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <TokenCardToken token={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "balance_usd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => (
      <Number
        value={row.getValue("balance_usd")}
        prefix="$"
        variant="neutral"
        size="balance"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "chain_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chain" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{getChainNameById(row.getValue("chain_id"))}</span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
    enableSorting: false,
    enableHiding: true,
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
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <Suspense fallback={null}>
        <TokenCardActions token={row.original} />
      </Suspense>
    ),
    enableSorting: false,
    enableHiding: true,
  },
];
