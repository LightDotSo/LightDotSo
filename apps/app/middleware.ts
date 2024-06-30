// Copyright 2023-2024 Light, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { COOKIES } from "@lightdotso/const";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export async function middleware(req: NextRequest) {
  // Get the session cookie
  const session_cookie = req.cookies.get(COOKIES.SESSION_COOKIE_ID);
  // Get the wallet cookie
  const wallet_cookie = req.cookies.get(COOKIES.WALLETS_COOKIE_ID);

  // Paths to redirect to if the user is logged in
  let pathArray = ["/"];
  if (
    process.env.NODE_ENV === "production" &&
    pathArray.some(path => req.nextUrl.pathname === path) &&
    wallet_cookie &&
    req.nextUrl.searchParams.size === 0
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
