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

import {
  Avatar,
  AvatarFallback,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  buttonVariants,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import type { FC } from "react";
import type { UserOperationData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardProps = {
  address: string;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCard: FC<UserOperationCardProps> = ({
  address,
  userOperation: { hash, chain_id, sender, status },
}) => {
  return (
    <Accordion
      key={hash}
      collapsible
      type="single"
      className="w-full rounded-md border border-border"
    >
      <AccordionItem className="w-full border-none" value="item-1">
        <div key={hash} className="flex items-center p-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{chain_id}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sender}</p>
            <p className="text-sm text-text-weak">{hash}</p>
          </div>
          <div className="ml-auto font-medium">
            <AccordionTrigger>
              <span
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hover:bg-transparent",
                )}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent className="bg-background-stronger px-4 pt-4">
          <div className="flex w-full justify-end">
            <Button asChild>
              <Link href={`/${address}/op/${chain_id}/${hash}`}>Confirm</Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
