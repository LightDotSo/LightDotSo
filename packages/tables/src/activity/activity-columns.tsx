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
import { PlaceholderOrb } from "@lightdotso/elements";
import { DataTableColumnHeader } from "@lightdotso/templates";
import { Avatar } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const activityColumns: ColumnDef<ActivityData>[] = [
  {
    id: "address",
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Avatar className="mr-3 size-7">
          <PlaceholderOrb address={row.getValue("address") ?? "0x"} />
        </Avatar>
        {row.getValue("address")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "entity",
    accessorKey: "entity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entity" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{row.getValue("entity")}</span>
      </div>
    ),
  },
  {
    id: "operation",
    accessorKey: "operation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operation" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{row.getValue("operation")}</span>
      </div>
    ),
  },
  {
    id: "timestamp",
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.original.timestamp).toLocaleString()}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
];
