// Copyright 2023-2024 Light, Inc.
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

import type { NftPortfolioData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import { Number } from "@lightdotso/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";

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
    queryKeys.nft_valuation.get({ address }).queryKey,
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!portfolio) {
    return null;
  }

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
