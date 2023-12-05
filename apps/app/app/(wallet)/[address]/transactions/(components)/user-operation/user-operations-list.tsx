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

import { getUserOperations } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { UserOperationCard } from "@/app/(wallet)/[address]/transactions/(components)/user-operation/user-operation-card";
import { UserOperationsEmpty } from "@/app/(wallet)/[address]/transactions/(components)/user-operation/user-operations-empty";
import { UserOperationsWrapper } from "@/app/(wallet)/[address]/transactions/(components)/user-operation/user-operations-wrapper";
import type { UserOperationData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type UserOperationsListProps = {
  address: Address;
  status: "all" | "proposed" | "executed";
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationsList: FC<UserOperationsListProps> = ({
  address,
  status,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queries.user_operation.list({ address, status }).queryKey,
  );

  const { data } = useSuspenseQuery<UserOperationData[] | null>({
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
    <UserOperationsWrapper>
      {data && data.length === 0 && <UserOperationsEmpty />}
      {data &&
        data.map(userOperation => (
          <UserOperationCard
            key={userOperation.hash}
            address={address}
            userOperation={userOperation}
          />
        ))}
    </UserOperationsWrapper>
  );
};
