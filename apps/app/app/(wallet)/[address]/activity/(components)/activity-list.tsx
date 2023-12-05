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

import { getTransactions } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { ActivityCard } from "@/app/(wallet)/[address]/activity/(components)/activity-card";
import { ActivityEmpty } from "@/app/(wallet)/[address]/activity/(components)/activity-empty";
import { ActivityWrapper } from "@/app/(wallet)/[address]/activity/(components)/activity-wrapper";
import type { TransactionData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type ActivityListProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ActivityList: FC<ActivityListProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TransactionData[] | undefined = queryClient.getQueryData(
    queries.transaction.list({ address }).queryKey,
  );

  const { data } = useSuspenseQuery<TransactionData[] | null>({
    queryKey: queries.transaction.list({ address }).queryKey,
    queryFn: async () => {
      const res = await getTransactions({
        params: {
          query: {
            address,
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

  return (
    <ActivityWrapper>
      {data && data.length === 0 && <ActivityEmpty />}
      {data &&
        data.map(transaction => (
          <ActivityCard
            key={transaction.hash}
            address={address}
            transaction={transaction}
          />
        ))}
    </ActivityWrapper>
  );
};
