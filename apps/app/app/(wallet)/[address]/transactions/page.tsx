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
import {
  Avatar,
  AvatarFallback,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@lightdotso/ui";
import Link from "next/link";

export const revalidate = 0;

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

  return res.match(
    res => {
      return (
        <div className="flex w-full space-y-8">
          {res.map(userOperation => (
            <Accordion
              key={userOperation.hash}
              type="single"
              collapsible
              className="w-full rounded-md border border-input"
            >
              <AccordionItem className="w-full " value="item-1">
                <div key={userOperation.hash} className="flex items-center p-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{userOperation.chain_id}</AvatarFallback>
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
                    <AccordionTrigger></AccordionTrigger>
                  </div>
                </div>
                <AccordionContent className="bg-accent px-4 pt-4">
                  <div className="flex w-full justify-end">
                    <Button asChild>
                      <Link
                        href={`/${params.address}/transactions/op/${userOperation.chain_id}/${userOperation.hash}`}
                      >
                        Confirm
                      </Link>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      );
    },
    _ => {
      return null;
    },
  );
}
