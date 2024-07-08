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

import { EmptyState } from "@lightdotso/elements";
import {
  useQueryUserOperationsCount,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { Table, TableBody, TableCell, TableRow } from "@lightdotso/ui";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OverviewSectionEmptyProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewSectionEmpty = ({
  address,
}: OverviewSectionEmptyProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { userOperationsCount } = useQueryUserOperationsCount({
    address: address as Address,
    status: null,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userOperationsCount || userOperationsCount?.count > 0) {
    return null;
  }

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="h-24 text-center">
            <EmptyState entity="transaction" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
