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

import type { ActivityData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/templates";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ActivityCardAddress,
  ActivityCardEntity,
  ActivityCardOperation,
  ActivityCardTimestamp,
} from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const activityColumns: ColumnDef<ActivityData>[] = [
  {
    id: "user_address",
    accessorKey: "user_address",
    accessorFn: row => {
      return row.user?.address;
    },
    header: ({ column }) => (
      <DataTableColumnHeader className="w-fit" column={column} title="User" />
    ),
    cell: ({ row }) => <ActivityCardAddress activity={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "entity",
    accessorKey: "entity",
    header: ({ column }) => (
      <DataTableColumnHeader className="w-3" column={column} title="Entity" />
    ),
    cell: ({ row }) => <ActivityCardEntity activity={row.original} />,
  },
  {
    id: "operation",
    accessorKey: "operation",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-10"
        column={column}
        title="Operation"
      />
    ),
    cell: ({ row }) => <ActivityCardOperation activity={row.original} />,
  },
  {
    id: "timestamp",
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-10"
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => <ActivityCardTimestamp activity={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
];
