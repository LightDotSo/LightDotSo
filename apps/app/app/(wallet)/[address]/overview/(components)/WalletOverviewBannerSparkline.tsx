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
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPortfolio } from "@lightdotso/client";
import { SparkAreaChart } from "@tremor/react";
import { cn } from "@lightdotso/utils";

export function WalletOverviewBannerSparkline({
  address,
}: {
  address: Address;
}) {
  const { data: portfolio } = useSuspenseQuery({
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
        _ => null,
      );
    },
  });

  if (!portfolio) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-start space-x-4">
      <div className="flex items-center space-x-2.5">
        <span className="text-2xl font-bold tracking-tighter text-primary sm:text-3xl">
          ${portfolio.balances && portfolio.balances[0].balance.toFixed(2)}
        </span>
        <span
          className={cn(
            "px-2 py-1 text-sm font-medium rounded text-white",
            portfolio.balance_change_24h > 0 ? "bg-emerald-500" : "bg-red-500",
          )}
        >
          {portfolio.balance_change_24h_percentage.toFixed(2)}%&nbsp;
          <span className="text-xs">
            (${portfolio.balance_change_24h.toFixed(3)})
          </span>
        </span>
      </div>
      <SparkAreaChart
        data={portfolio?.balances}
        categories={["balance"]}
        index="date"
        colors={[portfolio.balance_change_24h > 0 ? "emerald" : "red"]}
        className="h-8 w-14"
        // @ts-expect-error
        showAnimation
      />
    </div>
  );
}
