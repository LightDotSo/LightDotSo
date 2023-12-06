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

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { Send, RefreshCcw } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import type { Address } from "viem";
import type { TokenData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardActionsProps = { address: Address; token: TokenData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardActions: FC<TokenCardActionsProps> = ({
  address,
  token: { address: tokenAddress, chain_id, decimals, symbol },
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled size="sm" variant="strong">
                <RefreshCcw className="h-3 w-3" />
                <span className="sr-only">Open swap modal</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Swap {symbol}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button asChild size="sm" variant="strong">
                <Link
                  href={`/${address}/send?transfers=0:_:_:${chain_id}:erc20:${tokenAddress}|${decimals}|0`}
                >
                  <Send className="h-3 w-3" />
                  <span className="sr-only">Open send modal</span>
                </Link>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send {symbol}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
