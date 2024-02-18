// Copyright 2023-2024 Light, Inc.
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
import {
  ButtonIcon,
  Number,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { isTestnet } from "@lightdotso/utils";
import { InfoIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardBalanceProps = { token: TokenData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardBalance: FC<TokenCardBalanceProps> = ({
  token: { balance_usd, chain_id },
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isTestnet(chain_id)) {
    return (
      <div className="flex flex-row items-center space-x-1.5">
        <span className="text-sm text-text-weak">N/A</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ButtonIcon disabled size="xxs" variant="link">
                <InfoIcon className="size-3" />
              </ButtonIcon>
            </TooltipTrigger>
            <TooltipContent>Balance not available on testnet</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <Number value={balance_usd} prefix="$" variant="neutral" size="balance" />
  );
};
