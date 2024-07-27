// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import type { TokenData } from "@lightdotso/data";
import { useIsDemoPathname } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import {
  ButtonIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { Send, Shuffle } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenTableRowActionsProps = { token: TokenData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenTableRowActions: FC<TokenTableRowActionsProps> = ({
  token: { address: tokenAddress, chain_id, decimals, symbol },
}) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDemo = useIsDemoPathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (chain_id === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ButtonIcon disabled size="sm" variant="shadow">
                <Shuffle className="size-4" />
                <span className="sr-only">Open swap modal</span>
              </ButtonIcon>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Swap {symbol}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ButtonIcon asChild size="sm" variant="shadow">
                <Link
                  href={`/${isDemo ? "demo" : wallet}/send?transfers=0:_:_:${chain_id}:erc20:${tokenAddress}|${decimals}|0`}
                >
                  <Send className="size-4" />
                  <span className="sr-only">Open send modal</span>
                </Link>
              </ButtonIcon>
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
