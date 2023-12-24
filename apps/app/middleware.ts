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

export function middleware(request: NextRequest) {
  let wallet_cookie = request.cookies.get("lightdotso.wallet");

  let pathArray = ["/"];
  if (
    pathArray.some(path => request.nextUrl.pathname === path) &&
    wallet_cookie
  ) {
    console.info("wallet_cookie", wallet_cookie);
    const wallet = wallet_cookie.value;

    if (isAddress(wallet)) {
      return NextResponse.redirect(new URL(`/${wallet}/overview`, request.url));
    }
  }
}
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
