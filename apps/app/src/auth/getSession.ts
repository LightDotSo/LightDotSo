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

import { SESSION_COOKIE_ID } from "@lightdotso/const";
import { cookies } from "next/headers";
import { redis } from "@/client/redis";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Session = {
  id: string;
  inner: {
    data: {
      expirationTime: number;
      nonce: string;
      userId: string;
    };
    deleted: boolean | null | undefined;
    expiry: {
      AtDateTime: number[];
    };
    modified_at: string | null | undefined;
  };
};

// -----------------------------------------------------------------------------
// Cookie
// -----------------------------------------------------------------------------

export const getSessionCookie = () => {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE_ID)?.value;
};

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const getSession = async (): Promise<Session | null | undefined> => {
  const sessionId = getSessionCookie();

  if (!sessionId) {
    return undefined;
  }

  return redis.get(sessionId);
};
