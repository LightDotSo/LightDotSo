// Copyright 2023-2024 Light
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

"use server";

import {
  SESSION_COOKIE_ID,
  USER_COOKIE_ID,
  WALLETS_COOKIE_ID,
} from "@lightdotso/const";
import { cookies } from "next/headers";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export default async function action() {
  const cookieStore = cookies();

  cookieStore.delete(USER_COOKIE_ID);
  cookieStore.delete(WALLETS_COOKIE_ID);
  cookieStore.delete(SESSION_COOKIE_ID);
}
