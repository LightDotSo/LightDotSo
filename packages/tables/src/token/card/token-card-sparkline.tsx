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
import { isTestnet } from "@lightdotso/utils";
import { SparkAreaChart } from "@tremor/react";
import type { FC } from "react";
import type { Address } from "viem";
import { NotAvailableTestnetCard } from "../../(components)/card";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardSparklineProps = { token: TokenData; isExpanded?: boolean };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardSparkline: FC<TokenCardSparklineProps> = ({
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
    return <NotAvailableTestnetCard entityName="Chart" />;
  }

  if (!token_price || !token_price.prices || chain_id === 0 || isExpanded) {
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
