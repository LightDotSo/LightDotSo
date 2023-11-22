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
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { SparkAreaChart } from "@tremor/react";
import type { FC } from "react";
import type { Address } from "viem";
import type { TokenPriceData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardSparklineProps = {
  address: Address;
  chain_id: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardSparkline: FC<TokenCardSparklineProps> = ({
  address,
  chain_id,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: TokenPriceData | undefined = useQueryClient().getQueryData(
    queries.token_price.get(address, chain_id).queryKey,
  );

  const { data: token_price } = useSuspenseQuery<TokenPriceData | null>({
    queryKey: queries.token_price.get(address, chain_id).queryKey,
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

  if (!token_price) {
    return null;
  }

  return (
    <SparkAreaChart
      // @ts-expect-error
      showAnimation
      data={[...token_price.prices].reverse()}
      categories={["price"]}
      index="date"
      colors={[
        token_price.price_change_24h && token_price.price_change_24h > 0
          ? "emerald"
          : "red",
      ]}
      className="h-12 w-48"
    />
  );
};
