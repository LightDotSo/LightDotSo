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

import type { OwnerData } from "@lightdotso/data";
import { DataTableColumnHeader } from "@lightdotso/templates";
import { Checkbox } from "@lightdotso/ui/components/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { OwnerTableRowActions } from "./actions";
import { OwnerCardAddress } from "./card";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const ownerColumns: ColumnDef<OwnerData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        aria-label="Select all"
        className="translate-y-[2px]"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label="Select row"
        className="translate-y-[2px]"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "index",
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Index" />
    ),
    cell: ({ row }) => <div className="w-4">{row.getValue("index")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "address",
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => <OwnerCardAddress owner={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "weight",
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <span>{row.getValue("weight")}</span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <OwnerTableRowActions row={row} />,
  },
];
