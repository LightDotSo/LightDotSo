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
import { TokenImage } from "@lightdotso/elements/token-image";
import { ButtonIcon } from "@lightdotso/ui";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardTokenProps = {
  token: TokenData;
  canExpand?: boolean;
  isExpanded?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardToken: FC<TokenCardTokenProps> = ({
  token,
  canExpand,
  isExpanded,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10">
      {canExpand && (
        <ButtonIcon
          className="-left-6 -translate-y-1/2 md:-left-8 absolute top-1/2"
          variant="ghost"
          size="xs"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 transition-all duration-200",
              isExpanded && "rotate-90 ",
            )}
          />
        </ButtonIcon>
      )}
      <div className="flex items-center space-x-3">
        <TokenImage withChainLogo={token.chain_id !== 0} token={token} />
        <div className="flex flex-col space-y-0.5">
          <span className="text-text text-xs md:text-sm">
            {token.name ?? token.symbol}
          </span>
          <span className="text-text-weak text-xs">
            {refineNumberFormat(token.amount / 10 ** token.decimals)}{" "}
            {token.symbol}
          </span>
        </div>
      </div>
    </div>
  );
};
