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
import { useSuspenseQuery } from "@tanstack/react-query";
import { AreaChart, Card, Title } from "@tremor/react";
import type { Address } from "viem";

export function PortfolioChart({ address }: { address: Address }) {
  const { data } = useSuspenseQuery({
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

  if (!data) {
    return null;
  }

  return (
    <div className="justify-between md:flex">
      <div className="mt-8 hidden w-full sm:block">
        <>
          <Card>
            <Title>Portfolio Value</Title>
            <AreaChart
              className="mt-4 h-72 w-full"
              data={data.balances}
              index="date"
              categories={["balance"]}
              showLegend={false}
            />
          </Card>
        </>
      </div>
      <div className="mt-8 sm:hidden">
        <AreaChart
          categories={["balance"]}
          data={data.balances}
          index="date"
          startEndOnly={true}
          showGradient={false}
          showYAxis={false}
        />
      </div>
    </div>
  );
}
