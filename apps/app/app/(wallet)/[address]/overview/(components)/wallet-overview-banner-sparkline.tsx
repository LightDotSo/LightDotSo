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

import type { Address } from "viem";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { getPortfolio } from "@lightdotso/client";
import { SparkAreaChart } from "@tremor/react";
import { cn } from "@lightdotso/utils";

type PortfolioData = {
  balance: number;
  balance_change_24h: number;
  balance_change_24h_percentage: number;
  balances: {
    balance: number;
    date: string;
  }[];
};

export function WalletOverviewBannerSparkline({
  address,
}: {
  address: Address;
}) {
  const currentData: PortfolioData | undefined = useQueryClient().getQueryData([
    "portfolio",
    address,
  ]);

  const { data: portfolio } = useSuspenseQuery<PortfolioData | null>({
    queryKey: ["portfolio", address],
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

  return (
    <div className="flex flex-row items-center justify-between space-x-4">
      <div className="flex flex-col justify-start space-y-1.5">
        <span className="text-sm">Total Value</span>
        <span className="text-xl font-bold text-primary">
          $
          {portfolio.balances && portfolio.balance && portfolio.balance !== 0
            ? portfolio.balance.toFixed(2)
            : 0}
        </span>
        <span
          className={cn(
            "px-1.5 text-xs font-medium rounded text-white",
            portfolio.balance_change_24h && portfolio.balance_change_24h > 0
              ? "bg-emerald-500"
              : "bg-red-500",
          )}
        >
          {portfolio.balance_change_24h < 0 ? "-" : "+"}
          {portfolio.balance_change_24h_percentage &&
          portfolio.balance_change_24h_percentage !== 0
            ? portfolio.balance_change_24h_percentage.toFixed(2)
            : 0}
          %&nbsp;
          <span className="text-xs">
            {portfolio.balance_change_24h && portfolio.balance_change_24h
              ? `(${portfolio.balance_change_24h < 0 ? "-" : "+"}$${Math.abs(
                  portfolio.balance_change_24h,
                ).toFixed(3)})`
              : ""}
          </span>
        </span>
      </div>
      <SparkAreaChart
        data={[...portfolio.balances].reverse()}
        categories={["balance"]}
        index="date"
        colors={[
          portfolio.balance_change_24h && portfolio.balance_change_24h > 0
            ? "emerald"
            : "red",
        ]}
        className="h-8 w-full"
        // @ts-expect-error
        showAnimation
      />
    </div>
  );
}
