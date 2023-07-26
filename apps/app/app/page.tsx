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

import { db } from "@lightdotso/prisma";

export default async function Page() {
  const users = await db.selectFrom("User").selectAll().execute();

  return (
    <main className="text-red-500">
      <ul>
        {users.map(({ id, name }) => {
          return <li key={id}>{name}</li>;
        })}
      </ul>
    </main>
  );
}
