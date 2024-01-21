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

import type { TokenData } from "@lightdotso/data";
import { useSuspenseQueryTokenPrice } from "@lightdotso/query";
import { SparkAreaChart } from "@tremor/react";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardSparklineProps = { token: TokenData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardSparkline: FC<TokenCardSparklineProps> = ({
  token: { address, chain_id },
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token_price } = useSuspenseQueryTokenPrice({
    address: address as Address,
    chain_id: chain_id,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!token_price || chain_id === 0) {
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
      className="h-12 w-24"
    />
  );
};
