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

import type { WalletSettingsData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryTokens, useQueryTokensCount } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { tokenColumns } from "@lightdotso/tables";
import { TableSectionWrapper } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { DataTable } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/data-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TokensDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokensDataTable: FC<TokensDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { tokens, isTokensLoading } = useQueryTokens({
    address: address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: paginationState.pageSize,
    offset: offsetCount,
    group: true,
    chain_ids: null,
  });

  const { tokensCount, isTokensCountLoading } = useQueryTokensCount({
    address: address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isTokensLoading || isTokensCountLoading;
  }, [isTokensLoading, isTokensCountLoading]);

  const pageCount = useMemo(() => {
    if (!tokensCount || !tokensCount?.count) {
      return null;
    }
    return Math.ceil(tokensCount.count / paginationState.pageSize);
  }, [tokensCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TableSectionWrapper>
      <DataTable
        isLoading={isLoading}
        data={tokens ?? []}
        columns={tokenColumns}
        pageCount={pageCount ?? 0}
      />
    </TableSectionWrapper>
  );
};
