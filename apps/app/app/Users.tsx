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

"use client";

import type { RouterOutput } from "@lightdotso/trpc";
import { trpc } from "@lightdotso/trpc";

type UserListOutput = RouterOutput["user"]["list"];

function UsersItem(props: { users: UserListOutput }) {
  return (
    <ul className="text-red-300">
      {props.users.items.map(({ id }) => {
        return <li key={id}>{id}</li>;
      })}
    </ul>
  );
}

export function Users(props: { initialData: UserListOutput }) {
  const userQuery = trpc.user.list.useQuery(
    {},
    { initialData: props.initialData },
  );

  if (userQuery.error) {
    return <div>{userQuery.error.message}</div>;
  }

  if (userQuery.status !== "success") {
    <div>Loading</div>;
  }

  const { data } = userQuery;

  return data && <UsersItem users={data} />;
}
