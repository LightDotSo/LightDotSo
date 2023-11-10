/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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

import { handler } from "@/handlers/paths/[address]";
import { getQueryClient } from "@/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { inngest } from "@/inngest/client";
import { PrismaClient } from "@lightdotso/prisma";
import { InvokePortfolioButton } from "@/app/(wallet)/[address]/(components)/InvokePortfolioButton";
import { getAddress, type Address } from "viem";
import { serializeWalletBalance } from "@/utils/walletBalance";

export default async function Page({
  params,
}: {
  params: { address: string };
}) {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  await inngest.send({
    name: "wallet/portfolio.set",
    data: {
      address: params.address,
    },
  });

  const client = new PrismaClient();

  // For each erc20Id, find the most recent WalletBalance
  const balancesPromise = client.walletBalance.findMany({
    where: {
      walletAddress: getAddress(params.address),
      chainId: {
        not: 0,
      },
      isLatest: true,
    },
    include: {
      token: true,
    },
  });

  // Find the most recent WalletBalance
  const latestPortfolioPromise = client.$queryRaw<
    [
      {
        latest_balance: number;
        latest_balance_timestamp: Date;
      },
    ]
  >`
    SELECT balanceUSD as latest_balance, timestamp as latest_balance_timestamp
    FROM WalletBalance
    WHERE walletAddress = ${getAddress(params.address)} AND chainId = 0
    ORDER BY timestamp DESC
    LIMIT 1
  `;

  // Find the average balance for each day
  const pastPortfolioPromise = client.$queryRaw<
    [
      {
        average_balance: number;
        date: Date;
      },
    ]
  >`
    SELECT DATE(timestamp) as date, AVG(balanceUSD) as average_balance
    FROM WalletBalance
    WHERE walletAddress = ${getAddress(params.address)} AND chainId = 0
    GROUP BY DATE(timestamp)
    ORDER BY DATE(timestamp) DESC
  `;

  const [balances, latestPortfolio, pastPortfolio] = await Promise.all([
    balancesPromise,
    latestPortfolioPromise,
    pastPortfolioPromise,
  ]);

  console.info("balances", balances);
  console.info("latestPortfolio", latestPortfolio);
  console.info("pastPortfolio", pastPortfolio);

  // Combine the latestPortfolio and pastPortfolio into a single array
  const portfolio = pastPortfolio.map(item => ({
    date: item.date,
    balance: item.average_balance,
  }));
  portfolio.unshift({
    date: latestPortfolio[0].latest_balance_timestamp,
    balance: latestPortfolio[0].latest_balance,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <pre>
          <code>{serializeWalletBalance(balances)}</code>
        </pre>
        <pre>
          <code>{JSON.stringify(portfolio, null, 2)}</code>
        </pre>
        <InvokePortfolioButton address={params.address as Address} />
      </div>
    </HydrationBoundary>
  );
}
