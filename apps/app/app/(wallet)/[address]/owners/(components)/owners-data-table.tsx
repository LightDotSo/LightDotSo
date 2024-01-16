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

import { useQueryConfiguration } from "@lightdotso/query";
import { ownerColumns } from "@lightdotso/table";
import { TableSectionWrapper } from "@lightdotso/ui";
import { type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/owners/(components)/data-table/data-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OwnersDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OwnersDataTable: FC<OwnersDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
        <DataTable data={configuration?.owners ?? []} columns={ownerColumns} />
    </TableSectionWrapper>
  );
};
