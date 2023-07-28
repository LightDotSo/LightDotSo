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
import { prisma } from "@lightdotso/prisma";
import { getAuthServerSession } from "@lightdotso/auth";

export default async function Page() {
  const users = await prisma.user.findMany();
  const session = await getAuthServerSession();

  preload(session?.user?.name as `0x${string}`);

  return (
    <main className="text-red-500">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <EnsName params={{ address: session?.user?.name as `0x${string}` }} />
      <ul className="text-red-300">
        {users.map(({ id }) => {
          return <li key={id}>{id}</li>;
        })}
      </ul>
      <Connect />
    </main>
  );
}

// export const runtime = "edge";
