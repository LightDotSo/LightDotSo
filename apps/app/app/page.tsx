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

import { Connect } from "./connect";
import { EnsName, preload } from "@/components/EnsName";
import { http } from "@lightdotso/trpc";
import { getAuthSession } from "@lightdotso/auth";
import { use } from "react";

export default async function Page() {
  const user = use(http.user.me.query({}));

  const session = await getAuthSession();

  preload(session?.user?.name as `0x${string}`);

  return (
    <main className="text-red-500">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <EnsName params={{ address: session?.user?.name as `0x${string}` }} />
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Connect />
    </main>
  );
}

// export const runtime = "edge";
