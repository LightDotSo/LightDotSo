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
import type { FC } from "react";
import { extractChain } from "viem";
import { CHAINS } from "@/const/chains";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ActivityCardProps = {
  address: string;
  transaction: {
    chain_id: number;
    hash: string;
    timestamp: string;
  };
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ActivityCard: FC<ActivityCardProps> = ({
  address: _address,
  transaction,
}) => {
  // Try to extract chain from transaction
  const chain = extractChain({
    chains: Object.values(CHAINS),
    // @ts-ignore
    id: Object.values(CHAINS)
      .map(chain => chain.id)
      // @ts-ignore
      .includes(transaction.chain_id)
      ? transaction.chain_id
      : 1,
  });

  return (
    <Accordion
      key={transaction.hash}
      collapsible
      type="single"
      className="w-full rounded-md border border-border-primary-weak"
    >
      <AccordionItem className="w-full border-none" value="item-1">
        <div key={transaction.hash} className="flex items-center p-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{transaction.chain_id}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.timestamp}
            </p>
            <p className="text-sm text-text-weak">{transaction.hash}</p>
          </div>
          <div className="ml-auto font-medium">
            <AccordionTrigger>
              <span
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hover:bg-transparent",
                )}
              >
                {transaction.timestamp}
              </span>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent className="bg-background-stronger px-4 pt-4">
          <div className="flex w-full justify-end">
            <Button asChild variant="link">
              <a
                target="_blank"
                rel="noreferrer"
                href={`${chain?.blockExplorers?.default.url}/tx/${transaction.hash}`}
              >
                Go to explorer
              </a>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
