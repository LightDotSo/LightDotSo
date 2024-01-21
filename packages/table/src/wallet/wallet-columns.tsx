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

import type { WalletData } from "@lightdotso/data";
import { PlaceholderOrb } from "@lightdotso/element";
import { DataTableColumnHeader } from "@lightdotso/template";
import { Avatar } from "@lightdotso/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { WalletTableRowActions } from "./actions/wallet-table-row-actions";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const walletColumns: ColumnDef<WalletData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">{row.getValue("name")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
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
    id: "actions",
    cell: ({ row }) => <WalletTableRowActions row={row} />,
  },
];
