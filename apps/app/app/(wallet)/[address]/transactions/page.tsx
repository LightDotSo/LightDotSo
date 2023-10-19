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
import { Avatar, AvatarFallback, Button } from "@lightdotso/ui";
import Link from "next/link";
export default async function Page({
  params,
}: {
  params: { address: string };
}) {
  await handler(params);

  const res = await getUserOperations(
    {
      params: { query: { address: params.address } },
    },
    false,
  );

  if (res.isErr() || !res.value.data) return;

  return (
    <div className="max-w-2xl space-y-8">
      {res.value.data.map(userOperation => (
        <div key={userOperation.hash} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>Tx</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {userOperation.sender}
            </p>
            <p className="text-sm text-muted-foreground">
              {userOperation.hash}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Button asChild>
              <Link
                href={`/${params.address}/transaction/11155111/${userOperation.hash}`}
              >
                Open
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
