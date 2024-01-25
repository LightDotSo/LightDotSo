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

import { useQueryUserOperation } from "@lightdotso/query";
import { userOperationColumns } from "@lightdotso/tables";
import { type FC } from "react";
import type { Address, Hex } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OpDataTableProps {
  userOperationHash: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpDataTable: FC<OpDataTableProps> = ({ userOperationHash }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperation, isUserOperationLoading } = useQueryUserOperation({
    hash: userOperationHash,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userOperation) {
    return null;
  }

  return (
    <DataTable
      isLoading={isUserOperationLoading}
      data={userOperation ? [userOperation] : []}
      address={userOperation.sender as Address}
      columns={userOperationColumns}
      pageCount={1}
    />
  );
};
