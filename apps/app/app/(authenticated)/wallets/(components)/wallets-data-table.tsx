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

import { getWallets, getWalletsCount } from "@lightdotso/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(authenticated)/wallets/(components)/data-table/columns";
import { DataTable } from "@/app/(authenticated)/wallets/(components)/data-table/data-table";
import type { WalletCountData, WalletData } from "@/data";
import { queries } from "@/queries";
import { usePaginationQueryState } from "@/querystates";
import { useAuth } from "@/stores";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletsDataTable: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

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

  const currentData: WalletData[] | undefined = queryClient.getQueryData(
    queries.wallet.list({
      address: address as Address,
      limit: paginationState.pageSize,
      offset: offsetCount,
    }).queryKey,
  );

  const { data: wallets } = useQuery<WalletData[] | null>({
    queryKey: queries.wallet.list({
      address: address as Address,
      limit: paginationState.pageSize,
      offset: offsetCount,
    }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWallets({
        params: {
          query: {
            owner: address,
            limit: paginationState.pageSize,
            offset: offsetCount,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  const currentCountData: WalletCountData | undefined =
    queryClient.getQueryData(
      queries.wallet.list({ address: address as Address }).queryKey,
    );

  const { data: walletsCount } = useQuery<WalletCountData | null>({
    queryKey: queries.wallet.listCount({ address: address as Address })
      .queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWalletsCount({
        params: {
          query: {
            owner: address,
          },
        },
      });

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
    if (!walletsCount || !walletsCount?.count) {
      return null;
    }
    return Math.ceil(walletsCount.count / paginationState.pageSize);
  }, [walletsCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!pageCount) {
    return null;
  }

  return (
    <DataTable data={wallets ?? []} columns={columns} pageCount={pageCount} />
  );
};
