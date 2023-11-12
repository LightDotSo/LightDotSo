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

import { getTokens } from "@lightdotso/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { TokenCard } from "@/components/token-card";
import { TokensEmpty } from "@/components/tokens-empty";
import { TokensWrapper } from "@/components/tokens-wrapper";

export type TokensListProps = {
  address: Address;
};

export function TokensList({ address }: TokensListProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["tokens", address],
    queryFn: async () => {
      const res = await getTokens({
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
        err => {
          throw err;
        },
      );
    },
  });

  return (
    <TokensWrapper>
      {data && data.length === 0 && <TokensEmpty></TokensEmpty>}
      {data &&
        data.map(token => (
          <TokenCard key={token.address} address={address} token={token} />
        ))}
    </TokensWrapper>
  );
}
