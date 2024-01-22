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

import type { NftData } from "@lightdotso/data";
import type { ColumnDef } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Definitions
// -----------------------------------------------------------------------------

export const nftColumns: ColumnDef<NftData>[] = [
  {
    id: "chain",
    accessorKey: "chain",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "spam_score",
    accessorKey: "spam_score",
    accessorFn: row => {
      return row.collection?.spam_score;
    },
    filterFn: (row, id, value) => {
      if (row.getValue(id) === undefined) {
        return true;
      }
      return Number(value) === 0
        ? Number(row.getValue(id)) === 0
        : Number(value) <= Number(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "name",
    accessorKey: "name",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "description",
    accessorKey: "description",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
];
