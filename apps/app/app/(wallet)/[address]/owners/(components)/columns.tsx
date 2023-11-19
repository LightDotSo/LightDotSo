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

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@lightdotso/ui";
import { z } from "zod";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { weights } from "./data";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const ownerSchema = z.object({
  id: z.string(),
  address: z.string(),
  weight: z.number(),
});

export type Owner = z.infer<typeof ownerSchema>;

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const columns: ColumnDef<Owner>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Index" />
    ),
    cell: ({ row }) => <div className="w-4">{row.getValue("index")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => {
      const weight = weights.find(
        weight =>
          weight.value === (row.getValue("weight") as number).toString(),
      );

      if (!weight) {
        return null;
      }

      return (
        <div className="flex items-center">
          {weight.icon && (
            <weight.icon className="mr-2 h-4 w-4 text-text-weak" />
          )}
          <span>{weight.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as number).toString());
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
