// Copyright 2023-2024 Light.
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
