// Copyright 2023-2024 LightDotSo.
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

import { getSession } from "@/auth/getSession";
import { COOKIES } from "@lightdotso/const";
import { cookies } from "next/headers";

// -----------------------------------------------------------------------------
// Cookie
// -----------------------------------------------------------------------------

export const getUserIdCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIES.USER_COOKIE_ID)?.value;
};

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const verifyUserId = async () => {
  const userId = await getUserIdCookie();
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
