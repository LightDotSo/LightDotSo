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

import { AreaChart, Card, Title } from "@tremor/react";

export function PortfolioChart({ data }: { data: string }) {
  const portfolio: { balance: number; date: Date }[] = JSON.parse(data);

  return (
    <div className="justify-between md:flex">
      <div className="mt-8 hidden w-full sm:block">
        <>
          <Card>
            <Title>Portfolio Value</Title>
            <AreaChart
              className="mt-4 h-72 w-full"
              data={portfolio}
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
          data={portfolio}
          index="date"
          startEndOnly={true}
          showGradient={false}
          showYAxis={false}
        />
      </div>
    </div>
  );
}
