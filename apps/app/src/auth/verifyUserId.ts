// Copyright 2023-2024 Light.
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

import { USER_COOKIE_ID } from "@lightdotso/const";
import { cookies } from "next/headers";
import { getSession } from "@/auth/getSession";

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
