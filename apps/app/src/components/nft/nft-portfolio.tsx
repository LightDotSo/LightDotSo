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

import { Number } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import type { NftPortfolioData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftPortfolioProps = {
  address: Address;
  size?: "xl" | "balance";
  isNeutral?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftPortfolio: FC<NftPortfolioProps> = ({
  address,
  size = "xl",
  isNeutral = false,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const portfolio: NftPortfolioData | undefined = queryClient.getQueryData(
    queries.nft_valuation.get({ address }).queryKey,
  );

  if (!portfolio) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    portfolio &&
    portfolio.wallets &&
    portfolio.wallets.length > 0 && (
      <Number
        value={portfolio.wallets[0].usd_value ?? 0.0}
        size={size}
        prefix="$"
        variant={isNeutral ? "neutral" : undefined}
      />
    )
  );
};
