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

import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/overview/history/(components)/data-table/data-table";
import type { TransactionData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface HistoryDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const HistoryDataTable: FC<HistoryDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const trsansactions: TransactionData[] | undefined = queryClient.getQueryData(
    queries.transaction.list({
      address,
    }).queryKey,
  );

  if (!trsansactions) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <DataTable data={trsansactions ?? []} columns={columns} />
    </div>
  );
};
