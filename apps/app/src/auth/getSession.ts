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
import { redis } from "@lightdotso/redis";
import { cookies } from "next/headers";

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
  return cookieStore.get(COOKIES.SESSION_COOKIE_ID)?.value;
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
