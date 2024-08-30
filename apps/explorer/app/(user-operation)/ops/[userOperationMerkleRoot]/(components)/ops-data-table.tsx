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

import { DataTable } from "@/app/(user-operation)/(components)/data-table/data-table";
import { useQueryUserOperationMerkle } from "@lightdotso/query";
import { userOperationColumns } from "@lightdotso/tables/user-operation";
import { TableSectionWrapper } from "@lightdotso/ui/wrappers";
import type { FC } from "react";
import type { Hex } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OpsDataTableProps {
  userOperationMerkleRoot: Hex;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpsDataTable: FC<OpsDataTableProps> = ({
  userOperationMerkleRoot,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperationMerkle, isUserOperationMerkleLoading } =
    useQueryUserOperationMerkle(
      {
        root: userOperationMerkleRoot,
      },
      true,
    );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userOperationMerkle) {
    return null;
  }

  return (
    <TableSectionWrapper>
      <DataTable
        isDefaultOpen
        isTestnet
        isLoading={isUserOperationMerkleLoading}
        data={userOperationMerkle ? userOperationMerkle.user_operations : []}
        columns={userOperationColumns}
        pageCount={1}
      />
    </TableSectionWrapper>
  );
};
