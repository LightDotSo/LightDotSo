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
import { isAddress } from "viem";
import { edgeFlags } from "@/clients/redis";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export async function middleware(req: NextRequest) {
  // Get the wallet cookie
  let wallet_cookie = req.cookies.get("lightdotso.wallet");

  // Paths to redirect to if the user is logged in
  let pathArray = ["/"];
  if (
    process.env.NODE_ENV === "production" &&
    pathArray.some(path => req.nextUrl.pathname === path) &&
    wallet_cookie
  ) {
    const wallet = wallet_cookie.value;

    if (isAddress(wallet)) {
      return NextResponse.redirect(new URL(`/${wallet}/overview`, req.url));
    }
  }

  // Paths for edge flags
  // Get the address from the URL
  // e.g. /0x1234567890abcdef1234567890abcdef1234567
  const address = req.nextUrl.pathname.slice(1);
  if (
    process.env.NODE_ENV === "production" &&
    isAddress(address) &&
    req.nextUrl.pathname === `/${address}/ai`
  ) {
    const enabled = await edgeFlags
      .getFlag("app-ai", req.geo ?? {})
      .catch(err => {
        console.error(err);
        return false;
      });

    if (enabled) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL(`/${address}/overview`, req.url));
    }
  }
  return NextResponse.next();
}

// -----------------------------------------------------------------------------
// Cookie
// -----------------------------------------------------------------------------

export const config = {
  // From: https://nextjs.org/docs/app/building-your-application/routing/middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
