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

import { OpCard } from "@/components/op-card";
import { getUserOperations } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { TransactionsEmpty } from "@/components/transactions-empty";
import { TransactionsWrapper } from "@/components/transactions-wrapper";
import { queries } from "@/queries";
import type { FC } from "react";
import type { UserOperationData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TransactionsListProps = {
  address: Address;
  status: "all" | "proposed" | "executed";
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionsList: FC<TransactionsListProps> = ({
  address,
  status,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: UserOperationData | undefined =
    useQueryClient().getQueryData(
      queries.user_operation.list({ address, status }).queryKey,
    );

  const { data } = useSuspenseQuery<UserOperationData | null>({
    queryKey: queries.user_operation.list({ address, status }).queryKey,
    queryFn: async () => {
      const res = await getUserOperations({
        params: {
          query: {
            address,
            status: status === "all" ? undefined : status,
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
    <TransactionsWrapper>
      {data && data.length === 0 && <TransactionsEmpty></TransactionsEmpty>}
      {data &&
        data.map(userOperation => (
          <OpCard
            key={userOperation.hash}
            address={address}
            userOperation={userOperation}
          />
        ))}
    </TransactionsWrapper>
  );
};
