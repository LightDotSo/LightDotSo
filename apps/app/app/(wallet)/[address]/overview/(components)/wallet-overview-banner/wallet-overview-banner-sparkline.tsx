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

import { useQueryPortfolio } from "@lightdotso/query";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import { Number } from "@lightdotso/ui/components/number";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { SparkAreaChart } from "@tremor/react";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface WalletOverviewBannerSparklineProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WalletOverviewBannerSparkline: FC<
  WalletOverviewBannerSparklineProps
> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { portfolio } = useQueryPortfolio({ address: address });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!portfolio) {
    return null;
  }

  return (
    <div className="grid w-full grid-cols-2">
      <div className="col-span-1 flex flex-col justify-center space-y-2">
        <span className="text-text-weak">Net Worth</span>
        {portfolio.balances && (
          <Number value={portfolio.balance ?? 0.0} size="xl" prefix="$" />
        )}
      </div>
      <div className="col-span-1 flex flex-col justify-center space-y-2">
        <span
          className={cn(
            "rounded px-1.5 font-medium",
            portfolio.balance_change_24h && portfolio.balance_change_24h > 0
              ? "text-emerald-500"
              : "text-red-500",
          )}
        >
          {portfolio.balance_change_24h < 0 ? "-" : "+"}
          {portfolio.balance_change_24h_percentage &&
          portfolio.balance_change_24h_percentage !== 0
            ? Math.abs(portfolio.balance_change_24h_percentage).toFixed(2)
            : "0.00"}
          %&nbsp;
          <span className="text-xs">
            {portfolio.balance_change_24h && portfolio.balance_change_24h
              ? `(${portfolio.balance_change_24h < 0 ? "-" : "+"}$${refineNumberFormat(
                  Math.abs(portfolio.balance_change_24h),
                )})`
              : ""}
          </span>
        </span>
        <SparkAreaChart
          // @ts-expect-error
          showAnimation
          data={[...portfolio.balances].reverse()}
          categories={["balance"]}
          index="date"
          colors={[
            portfolio.balance_change_24h && portfolio.balance_change_24h > 0
              ? "emerald"
              : "red",
          ]}
          className="h-8 w-32 lg:w-full"
        />
      </div>
    </div>
  );
};
