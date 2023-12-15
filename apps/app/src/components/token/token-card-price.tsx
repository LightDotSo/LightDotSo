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

import { getTokenPrice } from "@lightdotso/client";
import { cn } from "@lightdotso/utils";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import type { TokenData, TokenPriceData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardPriceProps = {
  token: TokenData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardPrice: FC<TokenCardPriceProps> = ({
  token: { address, chain_id },
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TokenPriceData | undefined = queryClient.getQueryData(
    queries.token_price.get(address as Address, chain_id).queryKey,
  );

  const { data: token_price } = useSuspenseQuery<TokenPriceData | null>({
    queryKey: queries.token_price.get(address as Address, chain_id).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getTokenPrice({
        params: {
          query: {
            address: address,
            chain_id: chain_id,
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!token_price) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1.5">
      <span className="text-sm text-text/90">
        ${token_price.price.toFixed(2)}
      </span>
      <span
        className={cn(
          "text-text/90",
          token_price.price_change_24h && token_price.price_change_24h > 0
            ? "text-emerald-500"
            : "text-red-500",
        )}
      >
        {token_price.price_change_24h < 0 ? "-" : "+"}
        {token_price.price_change_24h_percentage &&
        token_price.price_change_24h_percentage !== 0
          ? Math.abs(token_price.price_change_24h_percentage).toFixed(2)
          : "0.00"}
        %&nbsp;
      </span>
    </div>
  );
};
