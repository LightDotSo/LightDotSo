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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import { kafka } from "@/clients/kafka";
import { prisma } from "@/clients/prisma";
import { ratelimit } from "@/clients/redis";
import { CHAINS, MAINNET_CHAINS } from "@/const/chains";

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const id = request.ip ?? "anonymous";
  const limit = await ratelimit.limit(id ?? "anonymous");

  // If the limit is not successful, return a 429 error
  if (!limit.success) {
    return NextResponse.json(limit, { status: 429 });
  }

  // Get the address from the query
  const addr = request.nextUrl.searchParams.get("address");

  // If the address is not valid, return an error
  if (addr && !isAddress(addr)) {
    return Response.json({
      revalidated: false,
      now: Date.now(),
      message: "Invalid address",
    });
  }

  // Convert the address to a checksum address
  const address = getAddress(addr as Address);

  // Check if the address exists in the prisma database
  const wallet = await prisma.wallet.findUnique({
    where: {
      address: address,
    },
    include: {
      walletSettings: true,
    },
  });

  // If the address does not exist, return an error
  if (!wallet) {
    return Response.json({
      revalidated: false,
      now: Date.now(),
      message: "Wallet does not exist",
    });
  }

  // If the testnet is enabled in the wallet settings, include testnet chains
  const chains = wallet.walletSettings?.isEnabledTestnet
    ? CHAINS
    : MAINNET_CHAINS;

  // Push mainnet chains to the queue
  const data = chains.map(chain => {
    return {
      topic: "covalent",
      value: {
        address: addr,
        chain_id: chain.id,
      },
    };
  });

  // Add the chainId `0` to the queue for the portfolio
  data.push({
    topic: "covalent",
    value: {
      address: addr,
      // @ts-ignore
      chain_id: 0,
    },
  });

  // Produce the data to the queue
  kafka.producer().produceMany(data);

  // Return a success message
  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: "Successfully invoked portfolio queue",
  });
}
