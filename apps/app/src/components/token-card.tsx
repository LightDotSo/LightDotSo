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
import Link from "next/link";
import { cn } from "@lightdotso/utils";

type TokenCardProps = {
  address: string;
  token: {
    address: string;
    amount: number;
    balance_usd: number;
    decimals: number;
    name?: string | null;
    symbol: string;
  };
};

export function TokenCard({ address, token }: TokenCardProps) {
  return (
    <Accordion key={token.address} type="single" collapsible>
      <AccordionItem className="w-full border-none" value="item-1">
        <div key={token.address} className="flex items-center p-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{token.symbol}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{token.name}</p>
            <p className="text-sm text-muted-foreground">{token.symbol}</p>
          </div>
          <div className="ml-auto font-medium">
            <AccordionTrigger>
              <span
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hover:bg-transparent",
                )}
              >
                ${token.balance_usd}
              </span>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent className="bg-accent px-4 pt-4">
          <div className="flex w-full justify-end">
            <Button asChild>
              <Link href={`/${address}/op/${token.symbol}/${token.symbol}`}>
                Confirm
              </Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
