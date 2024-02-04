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

import type { FrameRequest } from "@coinbase/onchainkit";
import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = "";
  let text: string | undefined = "";

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: "NEYNAR_ONCHAIN_KIT",
  });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  if (message?.input) {
    text = message.input;
  }

  if (message?.button === 2) {
    return NextResponse.redirect(
      "https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms",
      { status: 302 },
    );
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `🌲 Text: ${text}`,
        },
      ],
      image: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/park-2.png`,
      post_url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/frame`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
