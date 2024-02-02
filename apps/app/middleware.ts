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

import { SESSION_COOKIE_ID, WALLETS_COOKIE_ID } from "@lightdotso/const";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export async function middleware(req: NextRequest) {
  // Get the session cookie
  const session_cookie = req.cookies.get(SESSION_COOKIE_ID);
  // Get the wallet cookie
  const wallet_cookie = req.cookies.get(WALLETS_COOKIE_ID);

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

  // If the root route and doesn't have a search query, redirect to the home page
  // if the user doesn't have a session cookie
  if (
    process.env.NODE_ENV === "production" &&
    req.nextUrl.pathname === "/" &&
    !req.nextUrl.search &&
    !session_cookie
  ) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
}

// -----------------------------------------------------------------------------
// Config
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
