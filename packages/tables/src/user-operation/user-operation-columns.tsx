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

import type { UserOperationData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/templates";
import { ButtonIcon } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { UserOperationTableRowActions } from "./actions";
import {
  UserOperationCardInterpretationAction,
  UserOperationCardChain,
  UserOperationCardNonce,
  UserOperationCardStatus,
  UserOperationCardInterpretation,
} from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const userOperationColumns: ColumnDef<UserOperationData>[] = [
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
      <UserOperationCardInterpretationAction userOperation={row.original} />
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
    cell: ({ row }) => <UserOperationCardChain userOperation={row.original} />,
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
      <UserOperationCardInterpretation userOperation={row.original} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "nonce",
    accessorKey: "nonce",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nonce" />
    ),
    cell: ({ row }) => <UserOperationCardNonce userOperation={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <UserOperationCardStatus userOperation={row.original} />
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row: _ }) => (
      <div className="flex items-center justify-end">
        <ButtonIcon className="bg-background-strong" variant="ghost" size="sm">
          <ChevronDown className="size-4 transition-all duration-200" />
        </ButtonIcon>
      </div>
    ),
    enableHiding: false,
  },
  {
    id: "row_actions",
    cell: ({ row }) => <UserOperationTableRowActions row={row} />,
  },
];
