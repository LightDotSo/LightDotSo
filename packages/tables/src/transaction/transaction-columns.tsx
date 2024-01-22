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
import { DataTableColumnHeader } from "@lightdotso/templates";
import type { ColumnDef } from "@tanstack/react-table";
import { TransactionTableRowActions } from "./actions";
import {
  TransactionCardInterpretationAction,
  TransactionCardChain,
  TransactionCardInterpretation,
  TransactionCardTimestamp,
} from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const transactionColumns: ColumnDef<TransactionData>[] = [
  {
    id: "actions",
    accessorKey: "actions",
    accessorFn: row => {
      return row?.interpretation?.actions;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => (
      <TransactionCardInterpretationAction transaction={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "chain_id",
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
  },
  {
    id: "interpretation",
    accessorKey: "interpretation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interpretation" />
    ),
    cell: ({ row }) => (
      <TransactionCardInterpretation transaction={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "timestamp",
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
  },
  {
    id: "row_actions",
    cell: ({ row }) => <TransactionTableRowActions row={row} />,
  },
];
