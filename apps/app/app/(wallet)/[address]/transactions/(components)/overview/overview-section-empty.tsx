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

import type {
  UserOperationCountData,
  WalletSettingsData,
} from "@lightdotso/data";
import { EmptyState } from "@lightdotso/elements";
import { queryKeys } from "@lightdotso/query-keys";
import { Table, TableBody, TableCell, TableRow } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const currentData: UserOperationCountData | undefined =
    queryClient.getQueryData(
      queryKeys.user_operation.listCount({
        address: address,
        status: null,
        is_testnet: walletSettings?.is_enabled_testnet ?? false,
      }).queryKey,
    );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!currentData || currentData?.count > 0) {
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
