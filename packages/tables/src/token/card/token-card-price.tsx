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
import { cn, isTestnet, refineNumberFormat } from "@lightdotso/utils";
import type { FC } from "react";
import type { Address } from "viem";

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

  if (isTestnet(chain_id)) {
    return (
      <div className="flex flex-col space-y-1.5">
        <span className="text-sm text-text">-</span>
        <span className="text-sm text-text">-</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1.5">
      <span className="text-sm text-text">
        ${refineNumberFormat(token_price.price)}
      </span>
      <span
        className={cn(
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
