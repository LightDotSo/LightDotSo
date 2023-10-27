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

import { handler } from "@/handles/[address]";
import { getUserOperations } from "@lightdotso/client";
import { OpCard } from "@/app/(wallet)/[address]/transactions/op-card";

export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: { address: string };
}) {
  await handler(params);

  const res = await getUserOperations(
    {
      params: { query: { address: params.address, status: "proposed" } },
    },
    false,
  );

  return res.match(
    res => {
      return (
        <div className="flex w-full flex-col space-y-4">
          {res.map(userOperation => (
            <OpCard
              key={userOperation.hash}
              address={params.address}
              userOperation={userOperation}
            />
          ))}
        </div>
      );
    },
    _ => {
      return null;
    },
  );
}
