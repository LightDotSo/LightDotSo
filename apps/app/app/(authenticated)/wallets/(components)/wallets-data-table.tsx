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

import { getWallets } from "@lightdotso/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(authenticated)/wallets/(components)/data-table/columns";
import { DataTable } from "@/app/(authenticated)/wallets/(components)/data-table/data-table";
import type { WalletData } from "@/data";
import { queries } from "@/queries";
import { useAuth } from "@/stores/useAuth";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletsDataTable: FC = () => {
  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletData[] | undefined = queryClient.getQueryData(
    queries.wallet.list(address as Address).queryKey,
  );

  const { data: wallets } = useQuery<WalletData[] | null>({
    queryKey: queries.wallet.list(address as Address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWallets({
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
          return currentData ?? null;
        },
      );
    },
  });

  return <DataTable data={wallets ?? []} columns={columns} />;
};
