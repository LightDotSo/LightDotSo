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

import { useQueryPortfolio } from "@lightdotso/query";
import { Number } from "@lightdotso/ui";
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
    <div className="grid w-full grid-cols-2 gap-3">
      <div className="col-span-1 flex flex-col justify-center">
        <span className="text-text-weak">Net Worth</span>
        {portfolio.balances && (
          <Number value={portfolio.balance ?? 0.0} size="xl" prefix="$" />
        )}
      </div>
      <div className="col-span-1 flex flex-col justify-center">
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
          className="lg;w-full h-8 w-32"
        />
      </div>
    </div>
  );
};
