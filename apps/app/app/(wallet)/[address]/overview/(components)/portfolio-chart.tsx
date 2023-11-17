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
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AreaChart } from "@tremor/react";
import type { Address } from "viem";
import { WalletOverviewBannerSparkline } from "./wallet-overview-banner-sparkline";
import type { FC } from "react";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

type PortfolioData = {
  balance: number;
  balance_change_24h: number;
  balance_change_24h_percentage: number;
  balances: {
    balance: number;
    date: string;
  }[];
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface PortfolioChartProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const PortfolioChart: FC<PortfolioChartProps> = ({ address }) => {
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

  const balances = useMemo(() => {
    if (!portfolio || !portfolio.balances) {
      return [];
    }

    // Format the date into a human readable format for each date in balances
    const portfolioBalances = portfolio.balances.map(balance => {
      return {
        ...balance,
        date: new Date(balance.date).toLocaleDateString(),
      };
    });
    // Reverse the balances so that the chart starts from the beginning
    return [...portfolioBalances].reverse();
  }, [portfolio]);

  if (!portfolio) {
    return null;
  }

  const valueFormatter = function (number: number) {
    return "$ " + new Intl.NumberFormat("us").format(number).toString();
  };

  return (
    <>
      <div className="sm: mt-8 hidden w-full rounded-md border border-input bg-card p-8 py-16 sm:block sm:px-12">
        <>
          <WalletOverviewBannerSparkline address={address} />
          <AreaChart
            className="mt-12 h-72 w-full"
            data={balances}
            index="date"
            categories={["balance"]}
            colors={[
              portfolio.balance_change_24h && portfolio.balance_change_24h > 0
                ? "emerald"
                : "red",
            ]}
            showLegend={false}
            valueFormatter={valueFormatter}
            showAnimation
          />
        </>
      </div>
      <div className="mt-8 sm:hidden">
        <AreaChart
          categories={["balance"]}
          data={balances}
          colors={[
            portfolio.balance_change_24h && portfolio.balance_change_24h > 0
              ? "emerald"
              : "red",
          ]}
          index="date"
          startEndOnly={true}
          showGradient={false}
          showYAxis={false}
        />
      </div>
    </>
  );
};
