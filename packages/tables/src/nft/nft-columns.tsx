// Copyright 2023-2024 Light
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
