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

"use server";

import { getAuthSession } from "@lightdotso/auth";
import { experimental_createServerActionHandler } from "@trpc/next/app-dir/server";
import { cookies } from "next/headers";
import { appRouter } from "../routers/_app";

export const createAction = experimental_createServerActionHandler({
  router: appRouter,
  async createContext() {
    return {
      session: await getAuthSession(),
      headers: {
        cookie: cookies().toString(),
        "x-trpc-source": "server-action",
      },
    };
  },
});
