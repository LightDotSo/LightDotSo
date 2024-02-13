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

// From: https://github.com/Zizzamia/a-frame-in-100-lines/blob/1e401d0c8ecc8d1b9ef5b31e92723eede9f06c51/app/api/frame/route.ts
// License: MIT

import { getUserOperations, getWallets } from "@lightdotso/services";
import {
  type FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { type NextRequest, NextResponse } from "next/server";
import { type Address, getAddress } from "viem";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = "";
  // let text: string | undefined = "";

  const body: FrameRequest = await req.json();

  // Get the url search params and the text from the request
  // const { searchParams } = req.nextUrl;

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: "NEYNAR_ONCHAIN_KIT",
  });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  if (message?.button === 2) {
    return NextResponse.redirect("https://light.so/demo", { status: 302 });
  }

  if (!accountAddress) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: "Connect your wallet",
          },
        ],
        image: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/image?text="You need to connect your wallet"`,
        post_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame?`,
      }),
    );
  }

  const address = getAddress(accountAddress);

  const wallets = (
    await getWallets({ address: address, offset: 0, limit: 3 })
  )._unsafeUnwrap();

  let pendingTransactions: any[] = [];

  // For each wallet, get the pending transactions
  for (const wallet of wallets) {
    const queuedUserOperations = (
      await getUserOperations({
        address: wallet.address as Address,
        status: "queued",
        offset: 0,
        limit: 10,
        order: "asc",
        is_testnet: true,
      })
    )._unsafeUnwrap();

    pendingTransactions = pendingTransactions.concat(queuedUserOperations);
  }

  if (pendingTransactions.length === 0) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: "Go back",
          },
        ],
        image: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/image?text="You need't have any pending transactions"`,
        post_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame?`,
      }),
    );
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Transaction #1`,
        },
      ],
      image: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/image?text="You have some pending transactions"`,
      post_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
