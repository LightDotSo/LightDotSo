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

import { getTokens, getTokensCount } from "@lightdotso/client";
import {
  useQueryClient,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/data-table";
import type { TokenCountData, TokenData, WalletSettingsData } from "@/data";
import { queryKeys } from "@/queryKeys";
import { usePaginationQueryState } from "@/queryStates";
import { useAuth } from "@/stores";

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
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Effect Hooks
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

  const currentData: TokenData[] | undefined = queryClient.getQueryData(
    queryKeys.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
      limit: paginationState.pageSize,
      offset: offsetCount,
      group: true,
    }).queryKey,
  );

  const { data: tokens } = useQuery<TokenData[] | null>({
    placeholderData: keepPreviousData,
    queryKey: queryKeys.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
      limit: paginationState.pageSize,
      offset: offsetCount,
      group: true,
    }).queryKey,
    queryFn: async () => {
      const res = await getTokens(
        {
          params: {
            query: {
              address,
              is_testnet: walletSettings?.is_enabled_testnet ?? false,
              limit: paginationState.pageSize,
              offset: offsetCount,
              group: true,
            },
          },
        },
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data as TokenData[];
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  const currentCountData: TokenCountData | undefined = queryClient.getQueryData(
    queryKeys.token.listCount({
      address: address as Address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
  );

  const { data: tokensCount } = useQuery<TokenCountData | null>({
    queryKey: queryKeys.token.listCount({
      address: address as Address,
      is_testnet: walletSettings?.is_enabled_testnet ?? false,
    }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getTokensCount(
        {
          params: {
            query: {
              address: address,
              is_testnet: walletSettings?.is_enabled_testnet ?? false,
            },
          },
        },
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentCountData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

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
    <div className="rounded-md border border-border bg-background p-4">
      <DataTable
        data={tokens ?? []}
        columns={columns}
        pageCount={pageCount ?? 0}
      />
    </div>
  );
};
