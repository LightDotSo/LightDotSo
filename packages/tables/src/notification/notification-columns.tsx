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
