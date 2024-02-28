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
import { useModals } from "@lightdotso/stores";
import { ownerColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useEffect, type FC } from "react";
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
  const { setOwnerModalProps } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration, isConfigurationLoading } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setOwnerModalProps({
      initialOwners: configuration?.owners
        ? configuration?.owners.map(owner => {
            return {
              address: owner.address as Address,
              addressOrEns: undefined,
              weight: owner.weight,
            };
          })
        : [],
      initialThreshold: configuration?.threshold ?? 1,
      onOwnerSelect: () => {},
    });
  }, [configuration, setOwnerModalProps]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
      <DataTable
        isLoading={isConfigurationLoading}
        data={configuration?.owners ?? []}
        columns={ownerColumns}
      />
    </TableSectionWrapper>
  );
};
