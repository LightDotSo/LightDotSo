// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import type { TokenData } from "@lightdotso/data";
import { useQueryTokenPrice } from "@lightdotso/query";
import { cn, isTestnet, refineNumberFormat } from "@lightdotso/utils";
import type { FC } from "react";
import type { Address } from "viem";
import { NotAvailableTestnetCard } from "../../(components)/card";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardPriceProps = {
  token: TokenData;
  isExpanded?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardPrice: FC<TokenCardPriceProps> = ({
  token: { address, chain_id },
  isExpanded,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token_price } = useQueryTokenPrice({
    address: address as Address,
    chain_id: chain_id,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isTestnet(chain_id)) {
    return <NotAvailableTestnetCard entityName="Token price" />;
  }

  if (!token_price || chain_id === 0 || isExpanded) {
    return null;
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
