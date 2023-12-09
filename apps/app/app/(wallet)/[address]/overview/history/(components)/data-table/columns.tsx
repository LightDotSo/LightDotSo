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

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/data-table-column-header";
import type { TransactionData } from "@/data";
import { getChainById, getChainNameById } from "@/utils/chain";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const columns: ColumnDef<TransactionData>[] = [
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
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "hash",
    cell: ({ row }) => (
      <div className="flex items-center">
        <a
          className="hover:underline"
          target="_blank"
          rel="noreferrer"
          href={`${getChainById(row.getValue("chain_id"))?.blockExplorers
            ?.default.url}/tx/${row.getValue("hash")}
          `}
        >
          {row.getValue("hash")}
        </a>
      </div>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tx Hash" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>
          {new Date(row.getValue("timestamp")).toLocaleDateString() +
            " " +
            new Date(row.getValue("timestamp")).toLocaleTimeString()}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
];
