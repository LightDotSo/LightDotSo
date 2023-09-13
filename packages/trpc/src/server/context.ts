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

import { getAuthSession } from "@lightdotso/next-auth";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
// TODO: Add pusher
// import Pusher from "pusher-http-edge";

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // const eventServer = new Pusher({
  //   appId: env.PUSHER_APP_ID,
  //   key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  //   secret: env.PUSHER_SECRET,
  //   cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  //   useTLS: true,
  // });

  const session = await getAuthSession();

  return {
    session,
    headers: opts && Object.fromEntries(opts.req.headers),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
