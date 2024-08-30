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

import { DataTable } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/data-table";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import {
  useQueryTokens,
  useQueryTokensCount,
  useQueryWalletSettings,
} from "@lightdotso/query";
import { tokenColumns } from "@lightdotso/tables/token";
import { TableSectionWrapper } from "@lightdotso/ui/wrappers";
import { type FC, useMemo } from "react";
import type { Address } from "viem";

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

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { tokens, isTokensLoading } = useQueryTokens({
    address: address as Address,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: paginationState.pageSize,
    offset: offsetCount,
    group: true,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    chain_ids: null,
  });

  const { tokensCount, isTokensCountLoading } = useQueryTokensCount({
    address: address as Address,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return isTokensLoading || isTokensCountLoading;
  }, [isTokensLoading, isTokensCountLoading]);

  const pageCount = useMemo(() => {
    if (!tokensCount?.count) {
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
