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

import { USER_COOKIE_ID } from "@lightdotso/const";
import { cookies } from "next/headers";
import { getSession } from "./getSession";

// -----------------------------------------------------------------------------
// Cookie
// -----------------------------------------------------------------------------

export const getUserIdCookie = () => {
  const cookieStore = cookies();
  return cookieStore.get(USER_COOKIE_ID)?.value;
};

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const verifyUserId = async () => {
  const userId = getUserIdCookie();
  const session = await getSession();

  if (!session) {
    return undefined;
  }

  const sessionUserId = session?.inner?.data?.userId;

  if (!sessionUserId) {
    return undefined;
  }

  if (sessionUserId !== userId) {
    return undefined;
  }

  return userId;
};
