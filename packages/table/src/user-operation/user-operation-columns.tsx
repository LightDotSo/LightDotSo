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
import { ButtonIcon, DataTableColumnHeader } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { UserOperationCardChain } from "./card/user-operation-card-chain";
import { UserOperationCardHash } from "./card/user-operation-card-hash";
import { UserOperationCardNonce } from "./card/user-operation-card-nonce";
import { UserOperationCardStatus } from "./card/user-operation-card-status";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const userOperationColumns: ColumnDef<UserOperationData>[] = [
  {
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
    accessorKey: "hash",
    cell: ({ row }) => <UserOperationCardHash userOperation={row.original} />,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Operation Hash" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
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
          <ChevronDown className="h-4 w-4 transition-all duration-200" />
        </ButtonIcon>
      </div>
    ),
    enableHiding: false,
  },
];
