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

import type { TransactionData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { TransactionTableRowActions } from "./actions/transaction-table-row-actions";
import { TransactionCardActions } from "./card/transaction-card-actions";
import { TransactionCardChain } from "./card/transaction-card-chain";
import { TransactionCardHash } from "./card/transaction-card-hash";
import { TransactionCardInterpretation } from "./card/transaction-card-interpretation";
import { TransactionCardTimestamp } from "./card/transaction-card-timestamp";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const transactionColumns: ColumnDef<TransactionData>[] = [
  {
    accessorKey: "actions",
    accessorFn: row => {
      return row?.interpretation?.actions;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => <TransactionCardActions transaction={row.original} />,
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "chain_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chain" />
    ),
    cell: ({ row }) => <TransactionCardChain transaction={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
    enableSorting: true,
    enableHiding: true,
    size: 416,
  },
  {
    accessorKey: "interpretation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interpretation" />
    ),
    cell: ({ row }) => (
      <TransactionCardInterpretation transaction={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 416,
  },
  {
    accessorKey: "hash",
    cell: ({ row }) => <TransactionCardHash transaction={row.original} />,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tx Hash" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
    size: 416,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => <TransactionCardTimestamp transaction={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
    size: 96,
  },
  {
    id: "row_actions",
    cell: ({ row }) => <TransactionTableRowActions row={row} />,
  },
];
