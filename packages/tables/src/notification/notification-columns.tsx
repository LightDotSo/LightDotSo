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

import type { NotificationData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/templates";
import type { ColumnDef } from "@tanstack/react-table";
import { NotificationTableRowActions } from "./actions";
import {
  NotificationCardAddress,
  NotificationCardEntity,
  NotificationCardOperation,
  NotificationCardTimestamp,
} from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const notificationColumns: ColumnDef<NotificationData>[] = [
  {
    id: "user_address",
    accessorKey: "user_address",
    accessorFn: row => {
      return row.activity?.address;
    },
    header: ({ column }) => (
      <DataTableColumnHeader className="w-fit" column={column} title="User" />
    ),
    cell: ({ row }) => <NotificationCardAddress notification={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "entity",
    accessorKey: "entity",
    accessorFn: row => {
      return row.activity?.entity;
    },
    header: ({ column }) => (
      <DataTableColumnHeader className="w-3" column={column} title="Entity" />
    ),
    cell: ({ row }) => <NotificationCardEntity notification={row.original} />,
  },
  {
    id: "operation",
    accessorKey: "operation",
    accessorFn: row => {
      return row.activity?.operation;
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-10"
        column={column}
        title="Operation"
      />
    ),
    cell: ({ row }) => (
      <NotificationCardOperation notification={row.original} />
    ),
  },
  {
    id: "timestamp",
    accessorKey: "timestamp",
    accessorFn: row => {
      return row.activity?.timestamp;
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-10"
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => (
      <NotificationCardTimestamp notification={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <NotificationTableRowActions row={row} />,
  },
];
