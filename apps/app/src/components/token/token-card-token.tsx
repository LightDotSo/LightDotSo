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

import type { TokenData } from "@lightdotso/data";
import { ButtonIcon } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { ChevronRightIcon } from "lucide-react";
import type { FC } from "react";
import { TokenImage } from "@/components/token/token-image";

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
          className="absolute -left-6 md:-left-8 top-1/2 transform -translate-y-1/2"
          variant="ghost"
          size="xs"
        >
          <ChevronRightIcon
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isExpanded && "rotate-90 ",
            )}
          />
        </ButtonIcon>
      )}
      <div className="flex items-center space-x-3">
        <TokenImage token={token} />
        <div className="flex flex-col space-y-0.5">
          <span className="text-sm text-text">
            {token.name ?? token.symbol}
          </span>
          <span className="text-sm text-text-weak">
            {(token.amount / 10 ** token.decimals).toFixed(3)} {token.symbol}
          </span>
        </div>
      </div>
    </div>
  );
};
