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
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { TokenCard } from "@/components/token-card";
import { TokensEmpty } from "@/components/tokens-empty";
import { TokensWrapper } from "@/components/tokens-wrapper";
import type { FC } from "react";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

type WalletSettingsData = {
  is_enabled_testnet: boolean;
};

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

type TokenData = {
  address: string;
  amount: number;
  balance_usd: number;
  chain_id: number;
  decimals: number;
  name?: string | null;
  symbol: string;
}[];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TokensListProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokensList: FC<TokensListProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const walletSettings: WalletSettingsData | undefined =
    useQueryClient().getQueryData(queries.wallet.settings(address).queryKey);

  const currentData: TokenData | undefined = useQueryClient().getQueryData(
    queries.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
  );

  const { data } = useSuspenseQuery<TokenData | null>({
    queryKey: queries.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    queryFn: async () => {
      const res = await getTokens({
        params: {
          query: {
            address,
            is_testnet: walletSettings?.is_enabled_testnet,
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
    <TokensWrapper>
      {data && data.length === 0 && <TokensEmpty></TokensEmpty>}
      {data &&
        data.map(token => (
          <TokenCard key={token.address} address={address} token={token} />
        ))}
    </TokensWrapper>
  );
};
