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

import { getPortfolio } from "@lightdotso/client";
import { Number } from "@lightdotso/ui";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import type { TokenPortfolioData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenPortfolioProps = {
  address: Address;
  size?: "xl" | "balance";
  isNeutral?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenPortfolio: FC<TokenPortfolioProps> = ({
  address,
  size = "xl",
  isNeutral = false,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TokenPortfolioData | undefined = queryClient.getQueryData(
    queries.portfolio.get({ address }).queryKey,
  );

  const { data: portfolio } = useSuspenseQuery<TokenPortfolioData | null>({
    queryKey: queries.portfolio.get({ address }).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getPortfolio({
        params: {
          query: {
            address: address,
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

  if (!portfolio) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    portfolio.balances && (
      <Number
        value={portfolio.balance ?? 0.0}
        size={size}
        prefix="$"
        variant={isNeutral ? "neutral" : undefined}
      />
    )
  );
};
