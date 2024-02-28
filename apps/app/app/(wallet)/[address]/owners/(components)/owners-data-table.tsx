// Copyright 2023-2024 Light, Inc.
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

import { useQueryConfiguration } from "@lightdotso/query";
import { ownerColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/owners/(components)/data-table/data-table";
import {
  useIsOwnerEditQueryState,
  useOwnersQueryState,
} from "@lightdotso/nuqs";
import { OwnerData } from "@lightdotso/data";

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
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [isOwnerEdit] = useIsOwnerEditQueryState();
  const [owners] = useOwnersQueryState();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration, isConfigurationLoading } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const ownerData: OwnerData[] | undefined = useMemo(() => {
    if (isOwnerEdit) {
      return owners.map(owner => {
        return {
          ...owner,
          id: "",
          address: "",
          weight: 0,
        };
      });
    }

    return configuration?.owners;
  }, [configuration, isOwnerEdit, owners]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
      <DataTable
        isLoading={isConfigurationLoading}
        data={ownerData ?? []}
        columns={ownerColumns}
      />
    </TableSectionWrapper>
  );
};
